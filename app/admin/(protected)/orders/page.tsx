import { requireAdminSession } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; division?: string }>;
}) {
  await requireAdminSession();
  const { status, division } = await searchParams;
  const [orders, divisions] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(status ? { fulfilmentStatus: status } : {}),
        // Orders containing at least one item sold for this division
        ...(division ? { items: { some: { divisionId: division } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: division ? { items: { where: { divisionId: division }, select: { lineTotal: true } } } : undefined,
    }),
    prisma.division.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const activeDivision = divisions.find((d) => d.id === division);
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, division, ...extra })) if (v) p.set(k, v);
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  const statuses = ["NEW", "PAID", "MAKING", "READY_TO_PACK", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <AdminPageHeader title={activeDivision ? `Orders: ${activeDivision.name}` : "Orders"} />

      <div className="-mx-4 px-4 flex gap-2 mb-3 overflow-x-auto [scrollbar-width:none]">
        <FilterLink label="All divisions" active={!division} href={qs({ division: undefined })} />
        {divisions.map((d) => (
          <FilterLink key={d.id} label={d.name.replace(/ Patriots$/, "")} active={division === d.id} href={qs({ division: d.id })} />
        ))}
      </div>
      <div className="-mx-4 px-4 flex gap-2 mb-6 overflow-x-auto [scrollbar-width:none]">
        <FilterLink label="All" active={!status} href={qs({ status: undefined })} />
        {statuses.map((s) => (
          <FilterLink key={s} label={s} active={status === s} href={qs({ status: s })} />
        ))}
      </div>
      {activeDivision && (
        <p className="text-xs text-ink-soft -mt-3 mb-4">
          Orders with at least one {activeDivision.name} item. &quot;{activeDivision.name.replace(/ Patriots$/, "")} items&quot; is just that division&apos;s share of each order.
        </p>
      )}

      <div className="bg-blush rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfilment</th>
              <th className="p-4">Total</th>
              {activeDivision && <th className="p-4">{activeDivision.name.replace(/ Patriots$/, "")} items</th>}
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
                {activeDivision && (
                  <td className="p-4">
                    {formatPence(("items" in order ? (order.items as { lineTotal: number }[]) : []).reduce((t, i) => t + i.lineTotal, 0))}
                  </td>
                )}
                <td className="p-4 text-ink-soft">{order.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={activeDivision ? 7 : 6} className="p-8 text-center text-ink-soft">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link href={href} className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${active ? "bg-rose-dark text-ink" : "bg-blush text-ink-soft"}`}>
      {label}
    </Link>
  );
}
