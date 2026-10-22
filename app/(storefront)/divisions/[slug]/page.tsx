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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const division = await getDivisionBySlug(slug);
  if (!division) return {};
  return {
    title: `${division.name} Merch`,
    description: division.description ?? `Official ${division.name} hoodies, tees and gear.`,
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
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-rose text-white" : "bg-blush text-ink hover:bg-rose-dark hover:text-white"
    }`;

  return (
    <div>
      <section className="relative overflow-hidden bg-blush">
        {division.image ? (
          <Image src={division.image} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-dark/70 via-blush to-cloud" aria-hidden />
        )}
        <div className="relative container-page py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft mb-4">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/#divisions" className="hover:text-ink">Divisions</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="text-ink">{division.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Shield className="h-9 w-9 text-rose shrink-0" aria-hidden />
            <h1 className="font-display text-4xl sm:text-5xl">{division.name}</h1>
          </div>
          {division.description && (
            <p className="mt-3 max-w-2xl text-ink-soft">{division.description}</p>
          )}
        </div>
      </section>

      <div className="container-page py-10">
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8" role="list" aria-label="Filter by type">
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

        <div className="mt-12 text-center">
          <Link href="/#divisions" className="text-sm font-semibold text-rose hover:text-ink">
            &larr; See all divisions
          </Link>
        </div>
      </div>
    </div>
  );
}
