"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCartToken, getCartWithItems, cartSubtotal, priceForCartItem } from "@/lib/cart";
import { checkoutSchema } from "@/lib/validation";
import { validateDiscountCode } from "@/lib/discounts";
import { calculateDeliveryAmount } from "@/lib/delivery";
import { generateOrderNumber } from "@/lib/order-number";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { getCustomerSession } from "@/lib/customer-auth";

export type CheckoutState = { status: "idle" | "error"; message?: string };

export async function startCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || "",
    shippingLine1: formData.get("shippingLine1"),
    shippingLine2: formData.get("shippingLine2") || "",
    shippingCity: formData.get("shippingCity"),
    shippingCounty: formData.get("shippingCounty") || "",
    shippingPostcode: formData.get("shippingPostcode"),
    shippingCountry: formData.get("shippingCountry"),
    giftMessage: formData.get("giftMessage") || "",
    discountCode: formData.get("discountCode") || "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message || "Please check the form and try again." };
  }

  if (!stripeConfigured()) {
    return { status: "error", message: "Online payment is not yet configured. Add real Stripe keys to .env to enable checkout." };
  }

  const token = await getCartToken();
  const cart = await getCartWithItems(token);
  if (!cart || cart.items.length === 0) {
    return { status: "error", message: "Your basket is empty." };
  }

  // Server-side stock check — never trust what the client last saw.
  for (const item of cart.items) {
    const available = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
    const canSell = available >= item.quantity || item.product.continueSellingOOS || item.product.madeToOrder;
    if (!canSell) {
      return { status: "error", message: `${item.product.name} no longer has enough stock available.` };
    }
  }

  const subtotal = cartSubtotal(cart);
  const data = parsed.data;

  let discountAmount = 0;
  let discountCode: string | null = null;
  if (data.discountCode) {
    const result = await validateDiscountCode(data.discountCode, subtotal, data.email);
    if (!result.valid) return { status: "error", message: result.message };
    discountAmount = result.amount;
    discountCode = result.code;
  }

  const chargeableSubtotal = subtotal - discountAmount;
  const deliveryAmount = await calculateDeliveryAmount(chargeableSubtotal, data.shippingCountry);
  const total = chargeableSubtotal + deliveryAmount;

  const orderNumber = generateOrderNumber(await prisma.order.count());
  const customerSession = await getCustomerSession();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customerSession?.sub ?? null,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      shippingLine1: data.shippingLine1,
      shippingLine2: data.shippingLine2 || null,
      shippingCity: data.shippingCity,
      shippingCounty: data.shippingCounty || null,
      shippingPostcode: data.shippingPostcode,
      shippingCountry: data.shippingCountry,
      subtotal,
      discountCode,
      discountAmount,
      deliveryAmount,
      total,
      giftMessage: data.giftMessage || null,
      paymentStatus: "PENDING",
      fulfilmentStatus: "NEW",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantLabel: item.variant?.name ?? null,
          fragranceName: null,
          sku: item.variant?.sku ?? null,
          unitPrice: priceForCartItem(item) / item.quantity,
          quantity: item.quantity,
          lineTotal: priceForCartItem(item),
          giftMessage: item.giftMessage,
        })),
      },
    },
  });

  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: "gbp",
      product_data: { name: item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name },
      unit_amount: Math.round(priceForCartItem(item) / item.quantity),
    },
    quantity: item.quantity,
  }));

  if (deliveryAmount > 0) {
    lineItems.push({
      price_data: { currency: "gbp", product_data: { name: "Delivery" }, unit_amount: deliveryAmount },
      quantity: 1,
    });
  }

  let discounts: { coupon: string }[] | undefined;
  if (discountAmount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: discountAmount,
      currency: "gbp",
      duration: "once",
      name: discountCode ?? "Discount",
    });
    discounts = [{ coupon: coupon.id }];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: data.email,
    line_items: lineItems,
    discounts,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id } });

  redirect(session.url!);
}
