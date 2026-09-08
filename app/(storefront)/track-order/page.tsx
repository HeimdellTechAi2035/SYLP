import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";

export const metadata: Metadata = { title: "Track Your Order" };

const statusLabels: Record<string, string> = {
  NEW: "Order received",
  PAID: "Payment confirmed",
  MAKING: "Being handmade",
  READY_TO_PACK: "Ready to pack",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order: orderNumber, email } = await searchParams;
  const searched = Boolean(orderNumber && email);

  const order =
    searched
      ? await prisma.order.findFirst({
          where: { orderNumber: orderNumber!.trim(), email: { equals: email!.trim() } },
          include: { items: true },
        })
      : null;

  return (
    <div className="container-page py-14 max-w-xl mx-auto">
      <h1 className="font-display text-4xl mb-3">Track Your Order</h1>
      <p className="text-ink-soft mb-8">Enter your order number and the email address you used at checkout.</p>

      <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          name="order"
          defaultValue={orderNumber}
          required
          placeholder="Order number (e.g. HM-1001)"
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2.5"
        />
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          placeholder="Email address"
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2.5"
        />
        <button type="submit" className="px-6 py-2.5 rounded-full bg-rose-dark text-ink font-semibold">
          Track
        </button>
      </form>

      {searched && !order && (
        <p className="text-rose-dark text-sm">
          We couldn&apos;t find an order matching those details. Double-check your order number and email, or contact us for help.
        </p>
      )}

      {order && (
        <div className="bg-blush/70 rounded-2xl p-6">
          <p className="text-sm text-ink-soft mb-1">Order {order.orderNumber}</p>
          <p className="font-display text-2xl mb-4">{statusLabels[order.fulfilmentStatus] ?? order.fulfilmentStatus}</p>

          {order.trackingNumber && (
            <p className="text-sm mb-4">
              Tracking: <strong>{order.trackingNumber}</strong>
              {order.trackingCarrier && ` (${order.trackingCarrier})`}
              {order.trackingUrl && (
                <>
                  {" "}
                  — <a href={order.trackingUrl} className="text-rose-dark underline">Track parcel</a>
                </>
              )}
            </p>
          )}

          <ul className="space-y-1 text-sm text-ink-soft mb-4">
            {order.items.map((item) => (
              <li key={item.id}>{item.quantity} x {item.productName}{item.variantLabel && ` (${item.variantLabel})`}</li>
            ))}
          </ul>
          <p className="font-semibold">Total: {formatPence(order.total)}</p>
        </div>
      )}
    </div>
  );
}
