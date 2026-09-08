import type { Metadata } from "next";
import { getShopProducts, getCategories } from "@/lib/queries/products";
import ProductGrid from "@/components/product/ProductGrid";
import ShopFilters from "@/components/product/ShopFilters";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse all hoodies, t-shirts, keyrings, stickers, cups, pens, phone cases, puzzle boards, engraved wallets, wristbands and shopping bags from Support Your Local Patriot.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? (params.sort as "price-asc" | "price-desc" | "newest") : undefined;

  const [products, categories] = await Promise.all([
    getShopProducts({ categorySlug: category, q, sort }),
    getCategories(),
  ]);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-2">Shop All</h1>
      <p className="text-ink-soft mb-8">{products.length} product{products.length === 1 ? "" : "s"}</p>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <ShopFilters
          categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
          activeCategory={category}
          q={q}
          sort={sort}
        />
        <ProductGrid products={products} emptyMessage="No products match those filters yet." />
      </div>
    </div>
  );
}
