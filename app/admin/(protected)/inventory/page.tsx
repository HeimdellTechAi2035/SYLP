import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { updateProductStock, updateVariantStock } from "@/lib/actions/admin/inventory";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    include: { variants: true },
  });

  return (
    <div>
      <AdminPageHeader title="Inventory" />
      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Product / Variant</th>
              <th className="p-4">Low stock threshold</th>
              <th className="p-4">Stock</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <Fragment key={product.id}>
                <tr className="border-b border-ink/5">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-ink-soft">{product.lowStockThreshold}</td>
                  <td className="p-4" colSpan={2}>
                    {product.variants.length === 0 ? (
                      <StockForm
                        action={updateProductStock}
                        hiddenName="productId"
                        hiddenValue={product.id}
                        stock={product.stockQuantity}
                        low={product.stockQuantity <= product.lowStockThreshold}
                      />
                    ) : (
                      <span className="text-ink-soft text-xs">Managed per variant below</span>
                    )}
                  </td>
                </tr>
                {product.variants.map((v) => (
                  <tr key={v.id} className="border-b border-ink/5 bg-cream/40">
                    <td className="p-4 pl-8 text-ink-soft">↳ {v.name}</td>
                    <td className="p-4"></td>
                    <td className="p-4" colSpan={2}>
                      <StockForm
                        action={updateVariantStock}
                        hiddenName="variantId"
                        hiddenValue={v.id}
                        stock={v.stockQuantity}
                        low={v.stockQuantity <= product.lowStockThreshold}
                      />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockForm({
  action,
  hiddenName,
  hiddenValue,
  stock,
  low,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenName: string;
  hiddenValue: string;
  stock: number;
  low: boolean;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name={hiddenName} value={hiddenValue} />
      <input
        type="number"
        name="stockQuantity"
        defaultValue={stock}
        min={0}
        className={`w-20 rounded-lg border px-2 py-1 text-sm ${low ? "border-rose-dark text-rose-dark font-semibold" : "border-ink/15"}`}
      />
      <button type="submit" className="text-xs px-3 py-1.5 rounded-full bg-ink text-cream">Update</button>
    </form>
  );
}
