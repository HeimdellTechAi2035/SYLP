import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries/products";
import { getSiteSettings } from "@/lib/settings";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartForm from "@/components/product/AddToCartForm";
import StarRating from "@/components/ui/StarRating";
import ProductGrid from "@/components/product/ProductGrid";
import ReviewForm from "@/components/product/ReviewForm";
import { formatPence } from "@/lib/money";
import { Truck, ShieldCheck } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
    openGraph: product.socialImage || product.mainImage ? { images: [product.socialImage || product.mainImage!] } : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);

  if (!product || product.status !== "ACTIVE") notFound();

  const images = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...product.images.map((i) => i.url),
  ];

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const isGiftSet = product.productType === "GIFT_SET";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || undefined,
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: ((product.saleActive && product.salePrice ? product.salePrice : product.price) / 100).toFixed(2),
      availability:
        product.stockQuantity > 0 || product.continueSellingOOS || product.madeToOrder
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/products/${product.slug}`,
    },
  };

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-ink-soft mb-6" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/collections/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <ProductGallery images={images} name={product.name} />

        <div>
          {product.category && (
            <Link
              href={`/collections/${product.category.slug}`}
              className="text-xs uppercase tracking-wide text-rose-dark font-semibold"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="font-display text-3xl sm:text-4xl mt-1 mb-2">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="mb-4">
              <StarRating rating={avgRating} count={product.reviews.length} />
            </div>
          )}

          <AddToCartForm
            productId={product.id}
            price={product.price}
            salePrice={product.salePrice}
            saleActive={product.saleActive}
            variants={product.variants.map((v) => ({ id: v.id, name: v.name, stockQuantity: v.stockQuantity, priceOverride: v.priceOverride }))}
            stockQuantity={product.stockQuantity}
            continueSellingOOS={product.continueSellingOOS}
            madeToOrder={product.madeToOrder}
            giftMessageEnabled={product.giftMessageEnabled}
          />

          {product.variants.length > 0 && settings.supportEmail && (
            <div className="mt-4 rounded-xl border border-rose-dark/30 bg-blush px-4 py-3">
              <h2 className="font-display text-lg text-ink mb-1">Need a different size?</h2>
              <p className="text-sm text-ink-soft">
                Email us at{" "}
                <a href={`mailto:${settings.supportEmail}`} className="underline hover:text-ink">
                  {settings.supportEmail}
                </a>{" "}
                and we&apos;ll sort out your hoodie or t-shirt.
              </p>
            </div>
          )}

          {product.madeToOrder && product.productionTimeDays && (
            <p className="text-sm text-ink-soft mt-3">
              Made to order — please allow {product.productionTimeDays} day{product.productionTimeDays === 1 ? "" : "s"} for production before dispatch.
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-ink/10 pt-6">
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Truck className="h-4 w-4" /> Dispatch in {settings.estimatedDispatchDays}, delivery in {settings.estimatedDeliveryDays}.
              {settings.freeDeliveryThreshold && (
                <> Free UK delivery over {formatPence(settings.freeDeliveryThreshold)}.</>
              )}
            </p>
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <ShieldCheck className="h-4 w-4" /> Secure checkout via Stripe.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-3xl space-y-3">
        {product.shortDescription && (
          <DetailSection title="About This Product" open>
            <p className="whitespace-pre-line">{product.description || product.shortDescription}</p>
          </DetailSection>
        )}

        <DetailSection title="Product Details, Materials & Size">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {product.material && <Field label="Material" value={product.material} />}
            {product.netWeightGrams && <Field label="Net weight" value={`${product.netWeightGrams}g`} />}
            {product.dimensions && <Field label="Dimensions" value={product.dimensions} />}
          </dl>
          {isGiftSet && product.giftSetItems.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-sm mb-2">This set includes:</p>
              <ul className="text-sm text-ink-soft list-disc list-inside">
                {product.giftSetItems.map((item) => (
                  <li key={item.id}>{item.quantity} x {item.component.name}</li>
                ))}
              </ul>
            </div>
          )}
        </DetailSection>

        {product.careInstructions && (
          <DetailSection title="Care Instructions">
            <p>{product.careInstructions}</p>
          </DetailSection>
        )}

        {product.safetyWarnings && (
          <DetailSection title="Safety Information">
            <p>{product.safetyWarnings}</p>
          </DetailSection>
        )}

        <DetailSection title="Delivery & Returns">
          <p>
            Dispatch in {settings.estimatedDispatchDays}, delivery in {settings.estimatedDeliveryDays}. See our{" "}
            <Link href="/legal/delivery" className="text-rose-dark underline">Delivery Policy</Link> and{" "}
            <Link href="/legal/returns-refunds" className="text-rose-dark underline">Returns & Refunds Policy</Link> for full details.
          </p>
        </DetailSection>

        <DetailSection title={`Reviews (${product.reviews.length})`}>
          <div className="space-y-6 mb-8">
            {product.reviews.length === 0 && <p className="text-ink-soft">No reviews yet — be the first to share yours.</p>}
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-ink/10 pb-4">
                <StarRating rating={review.rating} />
                {review.title && <p className="font-medium mt-1">{review.title}</p>}
                <p className="text-sm text-ink-soft mt-1">{review.body}</p>
                <p className="text-xs text-ink-soft/70 mt-2">
                  {review.customerName}
                  {review.verifiedPurchase && " · Verified purchase"}
                </p>
                {review.merchantResponse && (
                  <p className="text-xs bg-blush rounded-lg p-3 mt-2">
                    <strong>Support Your Local Patriot:</strong> {review.merchantResponse}
                  </p>
                )}
              </div>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </DetailSection>
      </div>

      {product.relatedFrom.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
          <ProductGrid products={product.relatedFrom.map((r) => r.relatedProduct)} />
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-ink/10 py-4">
      <summary className="cursor-pointer font-semibold flex items-center justify-between list-none">
        {title}
        <span className="text-ink-soft group-open:rotate-180 transition-transform">&#9662;</span>
      </summary>
      <div className="mt-3 text-sm text-ink-soft leading-relaxed">{children}</div>
    </details>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="text-ink-soft">{value}</dd>
    </div>
  );
}
