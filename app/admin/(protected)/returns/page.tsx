import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminReturnsPage() {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: { in: ["REFUNDED", "PART_REFUNDED"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Returns & Refunds" />
      <p className="text-sm text-ink-soft mb-6">
        Refunds are issued from an order&apos;s detail page. This list shows every order with a refund recorded.
      </p>
      <div className="bg-blush rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/5 last:border-0">
                <td className="p-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-rose-dark">{order.orderNumber}</Link>
                </td>
                <td className="p-4 text-ink-soft">{order.firstName} {order.lastName}</td>
                <td className="p-4">{order.paymentStatus}</td>
                <td className="p-4">{formatPence(order.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-soft">No returns or refunds recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
