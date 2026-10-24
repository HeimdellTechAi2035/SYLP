import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getShopProducts } from "@/lib/queries/products";
import ProductGrid from "@/components/product/ProductGrid";

const smartCollections: Record<string, { title: string; description: string }> = {
  new: { title: "New In", description: "Our newest merch, added to the range." },
  "best-sellers": { title: "Best Sellers", description: "Customer favourites, loved again and again." },
  seasonal: { title: "Seasonal", description: "Limited-time seasonal designs." },
};

async function resolveCollection(slug: string) {
  if (slug in smartCollections) {
    return { kind: "smart" as const, ...smartCollections[slug] };
  }
  const category = await prisma.category.findUnique({ where: { slug, isActive: true } });
  if (!category) return null;
  return { kind: "category" as const, title: category.name, description: category.description ?? "" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!["hoodies", "t-shirts", "new"].includes(slug)) permanentRedirect("/shop");
  const collection = await resolveCollection(slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: `${collection.description ? `${collection.description.replace(/\.?$/, ".")} ` : ""}${collection.title} for every Support Your Local Patriot division: Preston, Merseyside, Greater Manchester, Blackpool and Southport. UK delivery.`,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!["hoodies", "t-shirts", "new"].includes(slug)) permanentRedirect("/shop");
  const collection = await resolveCollection(slug);
  if (!collection) notFound();

  const products = await getShopProducts(
    collection.kind === "smart"
      ? { smartCollection: slug as "new" | "best-sellers" | "seasonal" }
      : { categorySlug: slug }
  );

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-2">{collection.title}</h1>
      {collection.description && <p className="text-ink-soft mb-8 max-w-2xl">{collection.description}</p>}
      <ProductGrid products={products} emptyMessage="No products in this collection yet — check back soon." />
    </div>
  );
}
