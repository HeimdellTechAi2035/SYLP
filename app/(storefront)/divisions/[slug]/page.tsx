import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import {
  getDivisionBySlug,
  getShopProducts,
  getCategoriesForDivision,
} from "@/lib/queries/products";
import ProductGrid from "@/components/product/ProductGrid";
import { absUrl, breadcrumbLd, jsonLd, penceToPrice, siteUrl } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const division = await getDivisionBySlug(slug);
  if (!division) return {};
  const description =
    division.description && division.description.length > 60
      ? division.description
      : `Official ${division.name} merch: hoodies, t-shirts, tracksuits, mugs, keyrings, phone cases, wallets and gift sets with the ${division.name} crest. UK delivery.`;
  return {
    title: `${division.name} Merch`,
    description,
    alternates: { canonical: `/divisions/${division.slug}` },
    openGraph: {
      title: `${division.name} Merch | NorthWest Patriots`,
      description,
      url: `/divisions/${division.slug}`,
      images: division.image ? [{ url: division.image, alt: `${division.name} crest` }] : undefined,
    },
  };
}

export default async function DivisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug } = await params;
  const { type } = await searchParams;

  const division = await getDivisionBySlug(slug);
  if (!division) notFound();

  const types = await getCategoriesForDivision(slug);
  // Only honour a filter that matches one of this division's own types.
  const activeType = types.some((t) => t.slug === type) ? type : undefined;

  const products = await getShopProducts({ divisionSlug: slug, categorySlug: activeType });

  const pill = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-rose text-white" : "bg-blush text-ink hover:bg-rose-dark hover:text-white"
    }`;

  const listLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${division.name} Merch`,
    url: `${siteUrl()}/divisions/${division.slug}`,
    about: { "@type": "Organization", name: division.name, logo: absUrl(division.image), parentOrganization: { "@id": `${siteUrl()}/#organization` } },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl()}/products/${p.slug}`,
        name: p.name,
        image: absUrl(p.mainImage),
        offers: { "@type": "Offer", priceCurrency: "GBP", price: penceToPrice(p.saleActive && p.salePrice ? p.salePrice : p.price) },
      })),
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([listLd, breadcrumbLd([{ name: "Home", path: "/" }, { name: division.name, path: `/divisions/${division.slug}` }])]) }} />
      <section className="relative overflow-hidden bg-blush">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-dark/60 via-blush to-cloud" aria-hidden />
        <div className="relative container-page py-5 sm:py-12">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-ink-soft mb-3">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/#divisions" className="hover:text-ink">Divisions</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="text-ink">{division.name}</span>
          </nav>
          <div className="flex items-center gap-4 sm:gap-6">
            {division.image ? (
              <Image
                src={division.image}
                alt={`${division.name} logo`}
                width={160}
                height={160}
                priority
                className="h-24 w-24 sm:h-40 sm:w-40 shrink-0 rounded-2xl object-contain drop-shadow-lg"
              />
            ) : (
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-rose shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-5xl leading-tight">{division.name}</h1>
              {division.description && (
                <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-ink-soft">{division.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-5 sm:py-10">
        {types.length > 1 && (
          <div className="-mx-5 px-5 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap mb-5 sm:mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="Filter by type">
            <Link href={`/divisions/${slug}`} className={pill(!activeType)} role="listitem" aria-current={!activeType ? "page" : undefined}>
              All
            </Link>
            {types.map((t) => (
              <Link
                key={t.slug}
                href={`/divisions/${slug}?type=${t.slug}`}
                className={pill(activeType === t.slug)}
                role="listitem"
                aria-current={activeType === t.slug ? "page" : undefined}
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}

        <ProductGrid
          products={products}
          emptyMessage={`${division.name} merch is on its way — check back soon.`}
        />

        <div className="mt-8 sm:mt-12 text-center">
          <Link href="/#divisions" className="inline-block py-3 text-sm font-semibold text-rose hover:text-ink">
            &larr; See all divisions
          </Link>
        </div>
      </div>
    </div>
  );
}
