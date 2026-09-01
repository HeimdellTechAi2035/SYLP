import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { advanceOrderStatus } from "@/lib/actions/admin/orders";

const queueStatuses = ["PAID", "MAKING", "READY_TO_PACK"];
const nextStatus: Record<string, string> = {
  PAID: "MAKING",
  MAKING: "READY_TO_PACK",
  READY_TO_PACK: "PACKED",
};
const nextLabel: Record<string, string> = {
  PAID: "Start Making",
  MAKING: "Mark Made",
  READY_TO_PACK: "Mark Packed",
};

export default async function AdminProductionPage() {
  const orders = await prisma.order.findMany({
    where: { fulfilmentStatus: { in: queueStatuses } },
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });

  return (
    <div>
      <AdminPageHeader title="Production Queue" />
      {orders.length === 0 && <p className="text-ink-soft">Nothing to make right now.</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const advance = advanceOrderStatus.bind(null, order.id, nextStatus[order.fulfilmentStatus]);
          return (
            <div key={order.id} className="bg-white rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold">{order.orderNumber}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blush text-rose-dark font-medium">{order.fulfilmentStatus}</span>
              </div>
              <ul className="text-sm text-ink-soft mb-4 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>{item.quantity} x {item.productName}{item.variantLabel && ` (${item.variantLabel})`}</li>
                ))}
              </ul>
              {order.giftMessage && <p className="text-xs italic text-ink-soft mb-3">Gift: {order.giftMessage}</p>}
              <form action={advance}>
                <button type="submit" className="w-full py-2 rounded-full bg-ink text-cream text-sm font-medium">
                  {nextLabel[order.fulfilmentStatus]}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
