import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCustomerSession();
  if (!session) redirect("/account");

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

  if (!order || order.customerId !== session.sub) notFound();

  return (
    <div className="container-page py-14 max-w-2xl">
      <h1 className="font-display text-3xl mb-1">Order {order.orderNumber}</h1>
      <p className="text-ink-soft mb-8">{order.createdAt.toLocaleDateString("en-GB")} &middot; {order.fulfilmentStatus}</p>

      <div className="bg-white/70 rounded-2xl p-6 space-y-4">
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-ink-soft">{item.quantity} x {item.productName}{item.variantLabel && ` (${item.variantLabel})`}</span>
              <span>{formatPence(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink/10 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPence(order.subtotal)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-sage"><span>Discount</span><span>-{formatPence(order.discountAmount)}</span></div>}
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryAmount === 0 ? "Free" : formatPence(order.deliveryAmount)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatPence(order.total)}</span></div>
        </div>
        {order.trackingNumber && (
          <div className="border-t border-ink/10 pt-3 text-sm">
            <p className="font-semibold">Tracking</p>
            <p className="text-ink-soft">{order.trackingCarrier} {order.trackingNumber}</p>
            {order.trackingUrl && <a href={order.trackingUrl} className="text-rose-dark underline">Track parcel</a>}
          </div>
        )}
        <div className="border-t border-ink/10 pt-3 text-sm text-ink-soft">
          <p className="font-semibold text-ink mb-1">Delivery address</p>
          <p>{order.shippingLine1}{order.shippingLine2 && `, ${order.shippingLine2}`}</p>
          <p>{order.shippingCity}{order.shippingCounty && `, ${order.shippingCounty}`} {order.shippingPostcode}</p>
          <p>{order.shippingCountry}</p>
        </div>
      </div>
    </div>
  );
}
