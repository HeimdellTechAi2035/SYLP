import { formatPence } from "@/lib/money";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

/**
 * Builds the admin "new paid order" email. Deliberately contains everything
 * needed to manufacture, pack and dispatch — and nothing about how the
 * payment was made (no card/CVC/Stripe details ever touch this function).
 */
export function buildOrderNotificationEmail(order: OrderWithItems, siteUrl: string) {
  const subject = `New Support Your Local Patriot Order — ${order.orderNumber}`;

  const itemLines = order.items.map((item) => {
    const descriptors = item.variantLabel || "";
    const skuPart = item.sku ? ` (SKU ${item.sku})` : "";
    return [
      `${item.quantity} x ${item.productName}${descriptors ? ` — ${descriptors}` : ""}${skuPart}`,
      `  ${formatPence(item.unitPrice)} each — ${formatPence(item.lineTotal)}`,
    ].join("\n");
  });

  const addressLines = [
    `${order.firstName} ${order.lastName}`,
    order.shippingLine1,
    order.shippingLine2 || null,
    order.shippingCounty ? `${order.shippingCity}, ${order.shippingCounty}` : order.shippingCity,
    order.shippingPostcode,
    order.shippingCountry,
  ].filter(Boolean);

  const text = [
    `New paid order: ${order.orderNumber}`,
    `Placed: ${order.createdAt.toLocaleString("en-GB")}`,
    `Payment status: ${order.paymentStatus}`,
    "",
    "Customer:",
    `${order.firstName} ${order.lastName}`,
    order.email,
    order.phone || null,
    "",
    "Items:",
    "",
    itemLines.join("\n\n"),
    "",
    `Subtotal:\n${formatPence(order.subtotal)}`,
    order.discountAmount > 0 ? `\nDiscount${order.discountCode ? ` (${order.discountCode})` : ""}:\n-${formatPence(order.discountAmount)}` : null,
    `\nDelivery method:\n${order.deliveryMethodName || "Standard Delivery"}`,
    `\nCustomer paid delivery:\n${order.deliveryAmount === 0 ? "Free" : formatPence(order.deliveryAmount)}`,
    `\nTotal:\n${formatPence(order.total)}`,
    "",
    "Deliver to:",
    "",
    addressLines.join("\n"),
    order.giftMessage ? `\nGift message:\n${order.giftMessage}` : null,
    "",
    "View order:",
    `${siteUrl}/admin/orders/${order.id}`,
    "",
    "--- Admin-only fulfilment summary (not shown to the customer) ---",
    `Estimated postage:\n${formatPence(order.estimatedPostageCost)}`,
    `\nPackaging:\n${formatPence(order.packagingCost)}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { subject, text };
}
