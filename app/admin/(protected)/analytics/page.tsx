import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminAnalyticsPage() {
  const [totalRevenue, paidOrderCount, topProducts, statusCounts, paidOrders] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({ by: ["fulfilmentStatus"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        total: true,
        estimatedPostageCost: true,
        packagingCost: true,
        items: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            lineTotal: true,
            product: { select: { costPrice: true } },
          },
        },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.total ?? 0;
  const aov = paidOrderCount > 0 ? Math.round(revenue / paidOrderCount) : 0;

  // Cost of goods, fulfilment costs and profit — internal-only figures,
  // never derived from or shown on the storefront. Items whose product was
  // deleted or never had a cost price entered are excluded from the cost
  // total (rather than treated as £0 cost, which would inflate profit) and
  // counted separately so the gap is visible instead of hidden.
  let totalCogs = 0;
  let totalPostage = 0;
  let totalPackaging = 0;
  let itemsMissingCost = 0;
  const byProduct = new Map<
    string,
    { name: string; quantity: number; revenue: number; cost: number; costComplete: boolean }
  >();

  for (const order of paidOrders) {
    totalPostage += order.estimatedPostageCost;
    totalPackaging += order.packagingCost;
    for (const item of order.items) {
      const key = item.productId ?? item.productName;
      const entry = byProduct.get(key) ?? {
        name: item.productName,
        quantity: 0,
        revenue: 0,
        cost: 0,
        costComplete: true,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.lineTotal;
      if (item.product?.costPrice != null) {
        const cost = item.product.costPrice * item.quantity;
        entry.cost += cost;
        totalCogs += cost;
      } else {
        entry.costComplete = false;
        itemsMissingCost += 1;
      }
      byProduct.set(key, entry);
    }
  }

  const totalFulfilmentCost = totalPostage + totalPackaging;
  const grossProfit = revenue - totalCogs - totalFulfilmentCost;
  const profitMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0;

  const profitByProduct = Array.from(byProduct.values()).sort(
    (a, b) => b.revenue - b.cost - (a.revenue - a.cost)
  );

  return (
    <div>
      <AdminPageHeader title="Analytics" />
      <p className="text-sm text-ink-soft mb-6">
        Figures are calculated directly from your own order data — no third-party analytics required.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total revenue (paid orders)" value={formatPence(revenue)} />
        <StatCard label="Paid orders" value={String(paidOrderCount)} />
        <StatCard label="Average order value" value={formatPence(aov)} />
      </div>

      <h2 className="font-semibold mb-3">Buying &amp; profit (internal only — never shown on the storefront)</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <StatCard label="Cost of goods sold" value={formatPence(totalCogs)} />
        <StatCard label="Postage + packaging cost" value={formatPence(totalFulfilmentCost)} />
        <StatCard label="Gross profit" value={formatPence(grossProfit)} />
        <StatCard label="Gross margin" value={`${profitMargin}%`} />
      </div>
      {itemsMissingCost > 0 && (
        <p className="text-xs text-rose-dark mb-8">
          {itemsMissingCost} order line{itemsMissingCost === 1 ? "" : "s"} excluded from cost/profit totals —
          the product was deleted or has no cost price set. Add a cost price on the product&apos;s edit page for
          accurate figures.
        </p>
      )}
      {itemsMissingCost === 0 && <div className="mb-8" />}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Top products by quantity sold</h2>
          <div className="bg-blush rounded-xl divide-y divide-ink/10">
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
          <div className="bg-blush rounded-xl divide-y divide-ink/10">
            {statusCounts.map((s) => (
              <div key={s.fulfilmentStatus} className="flex justify-between p-4 text-sm">
                <span>{s.fulfilmentStatus}</span>
                <span className="text-ink-soft">{s._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3 mt-10">Profit by product</h2>
      <div className="bg-blush rounded-xl divide-y divide-ink/10 overflow-x-auto">
        <div className="grid grid-cols-5 gap-2 p-4 text-xs uppercase tracking-wide text-ink-soft">
          <span className="col-span-2">Product</span>
          <span>Sold</span>
          <span>Revenue</span>
          <span>Profit</span>
        </div>
        {profitByProduct.map((p) => (
          <div key={p.name} className="grid grid-cols-5 gap-2 p-4 text-sm items-center">
            <span className="col-span-2">{p.name}</span>
            <span className="text-ink-soft">{p.quantity}</span>
            <span className="text-ink-soft">{formatPence(p.revenue)}</span>
            <span className="font-medium">
              {formatPence(p.revenue - p.cost)}
              {!p.costComplete && <span className="text-rose-dark text-xs ml-1">(partial)</span>}
            </span>
          </div>
        ))}
        {profitByProduct.length === 0 && <p className="p-4 text-sm text-ink-soft">No sales yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-blush rounded-xl p-5">
      <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
