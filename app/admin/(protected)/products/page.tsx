import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StripeCatalogueSyncPanel from "@/components/admin/StripeCatalogueSyncPanel";
import { archiveProduct } from "@/lib/actions/admin/products";
import { getStripeCatalogueSummary } from "@/lib/actions/admin/stripe-catalogue-sync";

export default async function AdminProductsPage() {
  const [products, stripeSummary] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
    getStripeCatalogueSummary(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        action={
          <Link href="/admin/products/new" className="px-5 py-2.5 rounded-full bg-rose-dark text-ink font-semibold text-sm">
            + Add Product
          </Link>
        }
      />

      <StripeCatalogueSyncPanel totalSellable={stripeSummary.totalSellable} needsSync={stripeSummary.needsSync} />

      <div className="bg-blush rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Stripe</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-ink/5 last:border-0">
                <td className="p-4">
                  <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:text-rose-dark">
                    {product.name}
                  </Link>
                  <p className="text-xs text-ink-soft">{product.sku}</p>
                </td>
                <td className="p-4 text-ink-soft">{product.category?.name ?? "—"}</td>
                <td className="p-4">
                  <StatusBadge status={product.status} />
                </td>
                <td className="p-4">{formatPence(product.price)}</td>
                <td className="p-4">
                  {product.madeToOrder ? (
                    <span className="text-sage">Made to order</span>
                  ) : (
                    <span className={product.stockQuantity <= product.lowStockThreshold ? "text-rose-dark font-semibold" : ""}>
                      {product.stockQuantity}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <StripeSyncBadge status={product.status} syncStatus={product.stripeSyncStatus} />
                </td>
                <td className="p-4 text-right">
                  {product.status !== "ARCHIVED" && (
                    <form action={archiveProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="text-xs text-ink-soft underline hover:text-rose-dark">Archive</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-ink-soft">No products yet. Add your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-sage/20 text-sage",
    DRAFT: "bg-gold/20 text-ink",
    ARCHIVED: "bg-ink/10 text-ink-soft",
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? ""}`}>{status}</span>;
}

function StripeSyncBadge({ status, syncStatus }: { status: string; syncStatus: string }) {
  if (status !== "ACTIVE") return <span className="text-xs text-ink-soft/60">—</span>;
  const labels: Record<string, { text: string; className: string }> = {
    SYNCED: { text: "Synced", className: "text-sage" },
    PENDING: { text: "Syncing…", className: "text-ink-soft" },
    FAILED: { text: "Sync failed", className: "text-rose-dark font-medium" },
    NOT_SYNCED: { text: "Needs sync", className: "text-gold" },
  };
  const label = labels[syncStatus] ?? labels.NOT_SYNCED;
  return <span className={`text-xs ${label.className}`}>{label.text}</span>;
}
