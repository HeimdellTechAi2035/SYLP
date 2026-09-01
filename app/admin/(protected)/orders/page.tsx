import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { fulfilmentStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["NEW", "PAID", "MAKING", "READY_TO_PACK", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <AdminPageHeader title="Orders" />

      <div className="flex gap-2 mb-6 flex-wrap">
        <FilterLink label="All" active={!status} href="/admin/orders" />
        {statuses.map((s) => (
          <FilterLink key={s} label={s} active={status === s} href={`/admin/orders?status=${s}`} />
        ))}
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfilment</th>
              <th className="p-4">Total</th>
              <th className="p-4">Date</th>
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
                <td className="p-4">{order.fulfilmentStatus}</td>
                <td className="p-4">{formatPence(order.total)}</td>
                <td className="p-4 text-ink-soft">{order.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-soft">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-full text-xs font-medium ${active ? "bg-rose-dark text-cream" : "bg-white text-ink-soft"}`}>
      {label}
    </Link>
  );
}
