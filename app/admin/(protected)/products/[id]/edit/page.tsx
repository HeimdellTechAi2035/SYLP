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
  retryStripeSync,
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
  const [product, categories, otherProducts, allOtherProducts, packagingProfiles] = await Promise.all([
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
    prisma.packagingProfile.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const boundAddImage = addProductImage.bind(null, product.id);
  const boundAddVariant = addVariant.bind(null, product.id);
  const boundAddGiftItem = addGiftSetItem.bind(null, product.id);
  const boundAddRelated = addRelatedProduct.bind(null, product.id);
  const boundRetrySync = retryStripeSync.bind(null, product.id);

  return (
    <div>
      <AdminPageHeader title={`Edit: ${product.name}`} />
      <ProductForm action={boundUpdate} product={product} categories={categories} packagingProfiles={packagingProfiles} />

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">Stripe</h2>
        <StripeSyncSection product={product} retryAction={boundRetrySync} />
      </div>

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">Gallery Images</h2>
        <ul className="space-y-2 mb-4">
          {product.images.map((img) => (
            <li key={img.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
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
          <button type="submit" className="px-4 py-2 rounded-lg bg-rose-dark text-ink text-sm font-medium">Add</button>
        </form>
      </div>

      <div className="max-w-3xl mt-12 border-t border-ink/10 pt-6 pb-16">
        <h2 className="font-semibold text-lg mb-4">Variants (size / colour)</h2>
        <ul className="space-y-2 mb-4">
          {product.variants.map((v) => (
            <li key={v.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
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
          <FormField label="Variant name" name="variantName" placeholder="Support Your Local Patriot Hoodie — Large / Black" required />
          <FormField label="Variant SKU" name="variantSku" required />
          <FormField label="Size" name="variantSize" />
          <FormField label="Colour" name="variantColour" />
          <FormField label="Price override (£, optional)" name="variantPriceOverride" type="number" step="0.01" min="0" />
          {!product.madeToOrder && (
            <FormField label="Stock quantity" name="variantStock" type="number" min="0" defaultValue={0} />
          )}
          <FormSelect
            label="Packaging override (optional)"
            name="variantPackagingProfileId"
            defaultValue=""
            options={[{ value: "", label: "Use product's packaging" }, ...packagingProfiles.map((p) => ({ value: p.id, label: p.name }))]}
          />
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
            <li key={rel.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
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
              <li key={item.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
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

function StripeSyncSection({
  product,
  retryAction,
}: {
  product: {
    status: string;
    stripeSyncStatus: string;
    stripeSyncedAt: Date | null;
    stripeSyncError: string | null;
    stripeProductId: string | null;
    stripePriceId: string | null;
    stripeSalePriceId: string | null;
    variants: { id: string; name: string; stripePriceId: string | null }[];
  };
  retryAction: () => Promise<void>;
}) {
  const labels: Record<string, { text: string; className: string }> = {
    SYNCED: { text: "Synced", className: "text-sage" },
    PENDING: { text: "Syncing…", className: "text-ink-soft" },
    FAILED: { text: "Sync failed", className: "text-rose-dark font-semibold" },
    NOT_SYNCED: { text: product.status === "ACTIVE" ? "Needs sync" : "Not published yet", className: "text-ink-soft" },
  };
  const label = labels[product.stripeSyncStatus] ?? labels.NOT_SYNCED;

  return (
    <div className="bg-blush rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className={`text-sm font-medium ${label.className}`}>Stripe: {label.text}</p>
          {product.stripeSyncedAt && (
            <p className="text-xs text-ink-soft">Last synced: {product.stripeSyncedAt.toLocaleString("en-GB")}</p>
          )}
          {product.stripeSyncStatus === "FAILED" && product.stripeSyncError && (
            <p className="text-xs text-rose-dark mt-1">{product.stripeSyncError}</p>
          )}
        </div>
        {product.status === "ACTIVE" && (
          <form action={retryAction}>
            <button type="submit" className="px-4 py-2 rounded-full bg-rose-dark text-ink text-xs font-medium">
              Retry Stripe Sync
            </button>
          </form>
        )}
      </div>

      {(product.stripeProductId || product.variants.some((v) => v.stripePriceId)) && (
        <details className="text-xs text-ink-soft">
          <summary className="cursor-pointer">Technical details</summary>
          <dl className="mt-2 space-y-1">
            {product.stripeProductId && <p>Stripe Product: {product.stripeProductId}</p>}
            {product.stripePriceId && <p>Stripe Price (regular): {product.stripePriceId}</p>}
            {product.stripeSalePriceId && <p>Stripe Price (sale): {product.stripeSalePriceId}</p>}
            {product.variants.filter((v) => v.stripePriceId).map((v) => (
              <p key={v.id}>Stripe Price ({v.name}): {v.stripePriceId}</p>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
