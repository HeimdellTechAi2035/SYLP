import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminDashboardPage() {
  const [recentOrders, lowStockProducts, pendingReviews, newMessages, totalRevenue, paidOrderItems] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true },
    }).then((products) => products.filter((p) => p.stockQuantity <= p.lowStockThreshold)),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.orderItem.findMany({
      where: { order: { paymentStatus: "PAID" } },
      select: { quantity: true, product: { select: { costPrice: true } } },
    }),
  ]);

  // Best-effort gross profit for the headline card — full breakdown (postage,
  // packaging, per-product) lives on /admin/analytics. See the same
  // "exclude, don't zero-fill" reasoning there for items with no cost price.
  const revenue = totalRevenue._sum.total ?? 0;
  const totalCogs = paidOrderItems.reduce(
    (sum, item) => sum + (item.product?.costPrice != null ? item.product.costPrice * item.quantity : 0),
    0
  );
  const grossProfit = revenue - totalCogs;

  return (
    <div>
      <AdminPageHeader title="Dashboard" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total revenue" value={formatPence(revenue)} />
        <StatCard label="Gross profit" value={formatPence(grossProfit)} href="/admin/analytics" />
        <StatCard label="Low stock products" value={String(lowStockProducts.length)} href="/admin/inventory" />
        <StatCard label="Pending reviews" value={String(pendingReviews)} href="/admin/reviews" />
        <StatCard label="New messages" value={String(newMessages)} href="/admin/messages" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Recent orders</h2>
          <div className="bg-blush rounded-xl divide-y divide-ink/10">
            {recentOrders.length === 0 && <p className="p-4 text-sm text-ink-soft">No orders yet.</p>}
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex justify-between p-4 text-sm hover:bg-cream">
                <span>{order.orderNumber} &middot; {order.firstName} {order.lastName}</span>
                <span className="text-ink-soft">{order.fulfilmentStatus}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Low stock</h2>
          <div className="bg-blush rounded-xl divide-y divide-ink/10">
            {lowStockProducts.length === 0 && <p className="p-4 text-sm text-ink-soft">Nothing low on stock.</p>}
            {lowStockProducts.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex justify-between p-4 text-sm hover:bg-cream">
                <span>{product.name}</span>
                <span className="text-rose-dark font-medium">{product.stockQuantity} left</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="bg-blush rounded-xl p-5">
      <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
