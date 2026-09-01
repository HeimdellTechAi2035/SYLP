import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminAnalyticsPage() {
  const [totalRevenue, paidOrderCount, topProducts, statusCounts] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({ by: ["fulfilmentStatus"], _count: { _all: true } }),
  ]);

  const revenue = totalRevenue._sum.total ?? 0;
  const aov = paidOrderCount > 0 ? Math.round(revenue / paidOrderCount) : 0;

  return (
    <div>
      <AdminPageHeader title="Analytics" />
      <p className="text-sm text-ink-soft mb-6">
        Figures are calculated directly from your own order data — no third-party analytics required.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total revenue (paid orders)" value={formatPence(revenue)} />
        <StatCard label="Paid orders" value={String(paidOrderCount)} />
        <StatCard label="Average order value" value={formatPence(aov)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Top products by quantity sold</h2>
          <div className="bg-white rounded-xl divide-y divide-ink/10">
            {topProducts.map((p) => (
              <div key={p.productName} className="flex justify-between p-4 text-sm">
                <span>{p.productName}</span>
                <span className="text-ink-soft">{p._sum.quantity} sold &middot; {formatPence(p._sum.lineTotal ?? 0)}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="p-4 text-sm text-ink-soft">No sales yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Orders by status</h2>
          <div className="bg-white rounded-xl divide-y divide-ink/10">
            {statusCounts.map((s) => (
              <div key={s.fulfilmentStatus} className="flex justify-between p-4 text-sm">
                <span>{s.fulfilmentStatus}</span>
                <span className="text-ink-soft">{s._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-5">
      <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
