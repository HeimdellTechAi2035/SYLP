import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormSelect, FormTextarea, SubmitButton } from "@/components/admin/FormField";
import { updateOrderFulfilment, refundOrder } from "@/lib/actions/admin/orders";
import { retryOrderNotifications } from "@/lib/actions/admin/notifications";
import { estimateOrderMargin } from "@/lib/margin";

const statuses = ["NEW", "PAID", "MAKING", "READY_TO_PACK", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { costPrice: true } } } }, notifications: true },
  });
  if (!order) notFound();

  const boundUpdate = updateOrderFulfilment.bind(null, order.id);
  const boundRefund = refundOrder.bind(null, order.id);
  const boundRetryNotifications = retryOrderNotifications.bind(null, order.id);

  const { complete: costDataComplete, marginPence: estimatedMargin } = estimateOrderMargin(order, order.items);

  const latestByChannel = (channel: "EMAIL" | "PUSH") =>
    order.notifications
      .filter((n) => n.channel === channel && n.event === "ORDER_PAID")
      .sort((a, b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())[0];
  const emailNotification = latestByChannel("EMAIL");
  const pushNotifications = order.notifications.filter((n) => n.channel === "PUSH" && n.event === "ORDER_PAID");

  return (
    <div>
      <AdminPageHeader title={`Order ${order.orderNumber}`} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="bg-blush rounded-xl p-6">
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

          <div className="bg-blush rounded-xl p-6">
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

          <div className="bg-blush rounded-xl p-6">
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

          <div className="bg-blush rounded-xl p-6">
            <h2 className="font-semibold mb-3">Fulfilment Cost</h2>
            <p className="text-xs text-ink-soft mb-3">Internal only — never shown to the customer.</p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Customer delivery paid</span><span>{formatPence(order.deliveryAmount)}</span></div>
              <div className="flex justify-between"><span>Estimated postage</span><span>{formatPence(order.estimatedPostageCost)}</span></div>
              <div className="flex justify-between"><span>Packaging</span><span>{formatPence(order.packagingCost)}</span></div>
              <div className="flex justify-between font-semibold border-t border-ink/10 pt-1">
                <span>Estimated postage + packaging</span>
                <span>{formatPence(order.estimatedPostageCost + order.packagingCost)}</span>
              </div>
            </div>
            <div className="border-t border-ink/10 mt-3 pt-3 text-sm">
              <div className="flex justify-between">
                <span>Estimated order margin</span>
                <span className="font-semibold">{costDataComplete ? formatPence(estimatedMargin!) : "Cost data incomplete"}</span>
              </div>
              {!costDataComplete && (
                <p className="text-xs text-ink-soft mt-1">Add a cost price to every product in this order to see an estimate.</p>
              )}
            </div>
          </div>

          {order.paymentStatus === "PAID" && (
            <div className="bg-blush rounded-xl p-6">
              <h2 className="font-semibold mb-3">Notifications</h2>
              <div className="space-y-3 text-sm">
                <NotificationRow label="Order email" notification={emailNotification} />
                {pushNotifications.length === 0 ? (
                  <NotificationRow label="Phone push" notification={undefined} />
                ) : (
                  pushNotifications.map((n) => <NotificationRow key={n.id} label="Phone push" notification={n} />)
                )}
              </div>
              {(emailNotification?.status === "FAILED" || pushNotifications.some((n) => n.status === "FAILED")) && (
                <form action={boundRetryNotifications} className="mt-3">
                  <button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-rose-dark text-ink font-medium">
                    Retry notification
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="bg-blush rounded-xl p-6 h-fit space-y-4 text-sm">
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

function NotificationRow({
  label,
  notification,
}: {
  label: string;
  notification: { status: string; sentAt: Date | null; errorMessage: string | null } | undefined;
}) {
  if (!notification) {
    return (
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-ink-soft">Not sent yet</span>
      </div>
    );
  }

  if (notification.status === "SENT") {
    return (
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-sage">
          ✓ Sent{notification.sentAt && ` — ${notification.sentAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="text-rose-dark">{notification.status === "FAILED" ? "Failed" : "Pending"}</span>
    </div>
  );
}
