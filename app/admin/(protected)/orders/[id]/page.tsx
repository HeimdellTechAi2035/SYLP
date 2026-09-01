import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormSelect, FormTextarea, SubmitButton } from "@/components/admin/FormField";
import { updateOrderFulfilment, refundOrder } from "@/lib/actions/admin/orders";

const statuses = ["NEW", "PAID", "MAKING", "READY_TO_PACK", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const boundUpdate = updateOrderFulfilment.bind(null, order.id);
  const boundRefund = refundOrder.bind(null, order.id);

  return (
    <div>
      <AdminPageHeader title={`Order ${order.orderNumber}`} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-3">Items</h2>
            <ul className="space-y-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.quantity} x {item.productName}{item.variantLabel && ` (${item.variantLabel})`}</span>
                  <span>{formatPence(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/10 mt-3 pt-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPence(order.subtotal)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatPence(order.discountAmount)}</span></div>}
              <div className="flex justify-between"><span>Delivery</span><span>{formatPence(order.deliveryAmount)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPence(order.total)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-3">Update Status & Tracking</h2>
            <form action={boundUpdate} className="space-y-4">
              <FormSelect
                label="Fulfilment status"
                name="fulfilmentStatus"
                defaultValue={order.fulfilmentStatus}
                options={statuses.map((s) => ({ value: s, label: s }))}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Tracking carrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? ""} />
                <FormField label="Tracking number" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} />
              </div>
              <FormField label="Tracking URL" name="trackingUrl" defaultValue={order.trackingUrl ?? ""} />
              <FormTextarea label="Internal notes" name="internalNotes" defaultValue={order.internalNotes ?? ""} />
              <SubmitButton>Save</SubmitButton>
            </form>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-3">Refund</h2>
            <p className="text-xs text-ink-soft mb-3">Payment status: {order.paymentStatus}</p>
            <form action={boundRefund} className="flex flex-wrap items-end gap-3">
              <FormSelect
                label="Refund type"
                name="refundType"
                defaultValue="full"
                options={[{ value: "full", label: "Full refund" }, { value: "partial", label: "Partial refund" }]}
              />
              <FormField label="Amount (£, if partial)" name="amount" type="number" step="0.01" min="0" />
              <SubmitButton>Issue Refund</SubmitButton>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 h-fit space-y-4 text-sm">
          <div>
            <h2 className="font-semibold mb-1">Customer</h2>
            <p>{order.firstName} {order.lastName}</p>
            <p className="text-ink-soft">{order.email}</p>
            {order.phone && <p className="text-ink-soft">{order.phone}</p>}
          </div>
          <div>
            <h2 className="font-semibold mb-1">Shipping Address</h2>
            <p>{order.shippingLine1}{order.shippingLine2 && `, ${order.shippingLine2}`}</p>
            <p>{order.shippingCity}{order.shippingCounty && `, ${order.shippingCounty}`} {order.shippingPostcode}</p>
            <p>{order.shippingCountry}</p>
          </div>
          {order.giftMessage && (
            <div>
              <h2 className="font-semibold mb-1">Gift Message</h2>
              <p className="italic">{order.giftMessage}</p>
            </div>
          )}
          <div>
            <h2 className="font-semibold mb-1">Order Date</h2>
            <p>{order.createdAt.toLocaleString("en-GB")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
