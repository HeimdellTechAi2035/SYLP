import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import {
  updateProduct,
  addProductImage,
  removeProductImage,
  addVariant,
  removeVariant,
} from "@/lib/actions/admin/products";
import { addGiftSetItem, removeGiftSetItem } from "@/lib/actions/admin/gift-sets";
import { addRelatedProduct, removeRelatedProduct } from "@/lib/actions/admin/related-products";
import { FormField, FormSelect, SubmitButton } from "@/components/admin/FormField";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, fragrances, otherProducts, allOtherProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        giftSetItems: { include: { component: { select: { id: true, name: true } } } },
        relatedFrom: { include: { relatedProduct: { select: { id: true, name: true } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.fragrance.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { id: { not: id }, productType: { not: "GIFT_SET" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const boundAddImage = addProductImage.bind(null, product.id);
  const boundAddVariant = addVariant.bind(null, product.id);
  const boundAddGiftItem = addGiftSetItem.bind(null, product.id);
  const boundAddRelated = addRelatedProduct.bind(null, product.id);

  return (
    <div>
      <AdminPageHeader title={`Edit: ${product.name}`} />
      <ProductForm action={boundUpdate} product={product} categories={categories} fragrances={fragrances} />

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">Gallery Images</h2>
        <ul className="space-y-2 mb-4">
          {product.images.map((img) => (
            <li key={img.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm">
              <span className="truncate max-w-md">{img.url}</span>
              <form action={removeProductImage}>
                <input type="hidden" name="imageId" value={img.id} />
                <input type="hidden" name="productId" value={product.id} />
                <button type="submit" className="text-rose-dark text-xs underline">Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={boundAddImage} className="flex gap-3">
          <input name="url" placeholder="Image URL" required className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <input name="altText" placeholder="Alt text" className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm" />
          <button type="submit" className="px-4 py-2 rounded-lg bg-ink text-cream text-sm font-medium">Add</button>
        </form>
      </div>

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6 pb-16">
        <h2 className="font-semibold text-lg mb-4">Variants (fragrance / size / colour)</h2>
        <ul className="space-y-2 mb-4">
          {product.variants.map((v) => (
            <li key={v.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm">
              <span>{v.name} &middot; SKU {v.sku} &middot; {product.madeToOrder ? "Made to order" : `Stock ${v.stockQuantity}`}</span>
              <form action={removeVariant}>
                <input type="hidden" name="variantId" value={v.id} />
                <input type="hidden" name="productId" value={product.id} />
                <button type="submit" className="text-rose-dark text-xs underline">Remove</button>
              </form>
            </li>
          ))}
          {product.variants.length === 0 && <p className="text-sm text-ink-soft">No variants — this product sells as a single option.</p>}
        </ul>
        <form action={boundAddVariant} className="grid sm:grid-cols-2 gap-3">
          <FormField label="Variant name" name="variantName" placeholder="Vanilla Dream — Large" required />
          <FormField label="Variant SKU" name="variantSku" required />
          <FormField label="Size" name="variantSize" />
          <FormField label="Colour" name="variantColour" />
          <FormField label="Price override (£, optional)" name="variantPriceOverride" type="number" step="0.01" min="0" />
          {!product.madeToOrder && (
            <FormField label="Stock quantity" name="variantStock" type="number" min="0" defaultValue={0} />
          )}
          <div className="sm:col-span-2">
            <SubmitButton>Add Variant</SubmitButton>
          </div>
        </form>
      </div>

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6 pb-16">
        <h2 className="font-semibold text-lg mb-4">Related Products</h2>
        <p className="text-xs text-ink-soft mb-4">Shown as &ldquo;You May Also Like&rdquo; on this product&apos;s page.</p>
        <ul className="space-y-2 mb-4">
          {product.relatedFrom.map((rel) => (
            <li key={rel.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm">
              <span>{rel.relatedProduct.name} <span className="text-ink-soft text-xs">({rel.type})</span></span>
              <form action={removeRelatedProduct}>
                <input type="hidden" name="relationId" value={rel.id} />
                <input type="hidden" name="productId" value={product.id} />
                <button type="submit" className="text-rose-dark text-xs underline">Remove</button>
              </form>
            </li>
          ))}
          {product.relatedFrom.length === 0 && <p className="text-sm text-ink-soft">No related products linked yet.</p>}
        </ul>
        <form action={boundAddRelated} className="grid sm:grid-cols-2 gap-3">
          <FormSelect
            label="Related product"
            name="relatedProductId"
            options={allOtherProducts.map((p) => ({ value: p.id, label: p.name }))}
          />
          <FormSelect
            label="Relationship type"
            name="type"
            defaultValue="RELATED"
            options={[
              { value: "RELATED", label: "Related" },
              { value: "FREQUENTLY_BOUGHT", label: "Frequently Bought Together" },
              { value: "CROSS_SELL", label: "Cross-sell" },
            ]}
          />
          <div className="sm:col-span-2">
            <SubmitButton>Add Related Product</SubmitButton>
          </div>
        </form>
      </div>

      {product.productType === "GIFT_SET" && (
        <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6 pb-16">
          <h2 className="font-semibold text-lg mb-4">Gift Set Components</h2>
          <ul className="space-y-2 mb-4">
            {product.giftSetItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm">
                <span>{item.quantity} x {item.component.name}</span>
                <form action={removeGiftSetItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="giftSetId" value={product.id} />
                  <button type="submit" className="text-rose-dark text-xs underline">Remove</button>
                </form>
              </li>
            ))}
            {product.giftSetItems.length === 0 && <p className="text-sm text-ink-soft">No components added yet.</p>}
          </ul>
          <form action={boundAddGiftItem} className="grid sm:grid-cols-2 gap-3">
            <FormSelect
              label="Component product"
              name="componentId"
              options={otherProducts.map((p) => ({ value: p.id, label: p.name }))}
            />
            <FormField label="Quantity" name="quantity" type="number" min="1" defaultValue={1} />
            <div className="sm:col-span-2">
              <SubmitButton>Add Component</SubmitButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
