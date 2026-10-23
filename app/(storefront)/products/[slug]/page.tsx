import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getProductBySlug, getMoreFromDivision } from "@/lib/queries/products";
import { absUrl, breadcrumbLd, jsonLd, penceToPrice, SITE_NAME, siteUrl } from "@/lib/seo/site";
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
  if (!product || product.status !== "ACTIVE") return {};
  // Search results show ~155 characters: lead with what it is, then who it's
  // for, the price and delivery, so a short admin blurb still reads well.
  const priceText = formatPence(product.saleActive && product.salePrice ? product.salePrice : product.price);
  const base = (product.metaDescription || product.shortDescription || "").trim();
  const description =
    product.metaDescription && product.metaDescription.length >= 100
      ? product.metaDescription
      : [
          base || product.name,
          `Official ${product.division?.name ?? SITE_NAME} merch${product.variants.length ? `, sizes ${product.variants[0].size ?? product.variants[0].name}–${product.variants[product.variants.length - 1].size ?? product.variants[product.variants.length - 1].name}` : ""}.`,
          `${priceText} with UK delivery.`,
        ]
          .join(" ")
          .replace(/\.\s*\./g, ".")
          .slice(0, 300);
  const image = product.socialImage || product.mainImage;
  return {
    title: product.seoTitle || product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.seoTitle || product.name,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);

  if (!product) notFound();
  // A retired product's old link (shared, bookmarked or indexed by Google)
  // goes to its category instead of a dead end, keeping its search ranking.
  if (product.status === "ARCHIVED") permanentRedirect(product.category ? `/collections/${product.category.slug}` : "/shop");
  if (product.status !== "ACTIVE") notFound();

  // Main photo first, then the gallery - without showing the same photo twice.
  const images = [...new Set([...(product.mainImage ? [product.mainImage] : []), ...product.images.map((i) => i.url)])];
  const moreFromDivision =
    product.division && product.relatedFrom.length === 0
      ? await getMoreFromDivision(product.division.slug, product.slug)
      : [];

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const isGiftSet = product.productType === "GIFT_SET";

  const price = product.saleActive && product.salePrice ? product.salePrice : product.price;
  const inStock = product.stockQuantity > 0 || product.continueSellingOOS || product.madeToOrder;
  const url = `${siteUrl()}/products/${product.slug}`;
  const dayRange = (s: string | null | undefined) => {
    const m = (s ?? "").match(/(\d+)\D+(\d+)/);
    return m ? { "@type": "QuantitativeValue", minValue: Number(m[1]), maxValue: Number(m[2]), unitCode: "DAY" } : undefined;
  };
  const offer = (p: number, sku: string | null, name?: string) => ({
    "@type": "Offer",
    name,
    sku: sku || undefined,
    url,
    priceCurrency: "GBP",
    price: penceToPrice(p),
    availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${siteUrl()}/#organization` },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "GB" },
      shippingRate: {
        "@type": "MonetaryAmount",
        currency: "GBP",
        value: penceToPrice(
          settings.freeDeliveryThreshold != null && p >= settings.freeDeliveryThreshold ? 0 : settings.standardDeliveryPrice ?? 0
        ),
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: dayRange(settings.estimatedDispatchDays),
        transitTime: dayRange(settings.estimatedDeliveryDays),
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "GB",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      merchantReturnLink: `${siteUrl()}/legal/returns-refunds`,
    },
  });
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description || product.shortDescription || undefined,
    sku: product.sku,
    url,
    image: images.map(absUrl),
    brand: { "@type": "Brand", name: product.division?.name ?? SITE_NAME },
    category: product.category?.name,
    material: product.material || undefined,
    aggregateRating:
      product.reviews.length > 0
        ? { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length }
        : undefined,
    offers:
      product.variants.length > 0
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "GBP",
            lowPrice: penceToPrice(Math.min(...product.variants.map((v) => v.priceOverride ?? price))),
            highPrice: penceToPrice(Math.max(...product.variants.map((v) => v.priceOverride ?? price))),
            offerCount: product.variants.length,
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            offers: product.variants.map((v) => offer(v.priceOverride ?? price, v.sku, v.name)),
          }
        : offer(price, product.sku),
  };
  const crumbs = breadcrumbLd([
    { name: "Home", path: "/" },
    ...(product.division
      ? [{ name: product.division.name, path: `/divisions/${product.division.slug}` }]
      : product.category
        ? [{ name: product.category.name, path: `/collections/${product.category.slug}` }]
        : [{ name: "Shop", path: "/shop" }]),
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />

      <nav className="text-xs text-ink-soft mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        {product.division ? (
          <>
            {" / "}
            <Link href={`/divisions/${product.division.slug}`} className="hover:text-ink">{product.division.name}</Link>
          </>
        ) : product.category && (
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
                    <strong>NorthWest Patriots:</strong> {review.merchantResponse}
                  </p>
                )}
              </div>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </DetailSection>
      </div>

      {moreFromDivision.length > 0 && product.division && (
        <div className="mt-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl">More from {product.division.name}</h2>
            <Link href={`/divisions/${product.division.slug}`} className="text-sm font-semibold text-rose shrink-0">
              See all &rarr;
            </Link>
          </div>
          <ProductGrid products={moreFromDivision} />
        </div>
      )}

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
