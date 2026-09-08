import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";
import { notifyAdminOfPaidOrder } from "@/lib/notifications/order-paid";
import { formatPence } from "@/lib/money";
import { CART_COOKIE } from "@/lib/cart";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id || !stripeConfigured()) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Order confirmation</h1>
        <p className="text-ink-soft">We couldn&apos;t find that order. If you&apos;ve just paid, check your email for confirmation.</p>
      </div>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(session_id).catch(() => null);
  const orderId = session?.metadata?.orderId;

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    : null;

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Order not found</h1>
        <p className="text-ink-soft">If you believe this is an error, please contact us with your payment confirmation email.</p>
      </div>
    );
  }

  // Fallback reconciliation for local dev / any delay before the webhook lands — idempotent.
  if (session?.payment_status === "paid" && order.paymentStatus !== "PAID") {
    await markOrderPaid(order.id);
  }

  const paid = session?.payment_status === "paid" || order.paymentStatus === "PAID";

  if (paid) {
    // The customer's own browser landing here is never trusted on its own —
    // `paid` above only became true because Stripe's own session object
    // (fetched fresh, not a client-supplied flag) reported payment_status
    // "paid". Safe to fire here too: idempotent, same as the webhook path.
    await notifyAdminOfPaidOrder(order.id);

    const cookieStore = await cookies();
    const cartToken = cookieStore.get(CART_COOKIE)?.value;
    if (cartToken) {
      // deleteMany (not delete) so a cart already removed by an earlier visit
      // to this page doesn't log a spurious "record not found" error.
      await prisma.cart.deleteMany({ where: { token: cartToken } });
    }
  }

  return (
    <div className="container-page py-16 max-w-2xl mx-auto">
      {paid ? (
        <>
          <div className="flex items-center gap-3 text-sage mb-4">
            <CheckCircle2 className="h-8 w-8" />
            <h1 className="font-display text-3xl">Thank you for your order!</h1>
          </div>
          <p className="text-ink-soft mb-8">
            Order <strong>{order.orderNumber}</strong> is confirmed. We&apos;ve started making and packing it with care —
            you&apos;ll receive an email once it&apos;s dispatched.
          </p>
        </>
      ) : (
        <h1 className="font-display text-3xl mb-4">Payment processing</h1>
      )}

      <div className="bg-blush/70 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-sm mb-2">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-ink-soft">{item.quantity} x {item.productName}{item.variantLabel && ` (${item.variantLabel})`}</span>
                <span>{formatPence(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-ink/10 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPence(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sage"><span>Discount {order.discountCode && `(${order.discountCode})`}</span><span>-{formatPence(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryAmount === 0 ? "Free" : formatPence(order.deliveryAmount)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatPence(order.total)}</span></div>
        </div>
        <div className="border-t border-ink/10 pt-3 text-sm text-ink-soft">
          <p className="font-semibold text-ink mb-1">Delivery address</p>
          <p>{order.firstName} {order.lastName}</p>
          <p>{order.shippingLine1}{order.shippingLine2 && `, ${order.shippingLine2}`}</p>
          <p>{order.shippingCity}{order.shippingCounty && `, ${order.shippingCounty}`} {order.shippingPostcode}</p>
          <p>{order.shippingCountry}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="px-6 py-3 rounded-full bg-rose-dark text-ink font-semibold">Continue Shopping</Link>
        <Link href={`/track-order?order=${order.orderNumber}`} className="px-6 py-3 rounded-full border border-ink/15 font-semibold">Track Order</Link>
      </div>
    </div>
  );
}
