import type { Metadata } from "next";
import { getShopProducts, getCategories, getScentFamilies } from "@/lib/queries/products";
import ProductGrid from "@/components/product/ProductGrid";
import ShopFilters from "@/components/product/ShopFilters";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse all handmade wax melts, candles and gift sets from HandMade by Mia.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const scent = typeof params.scent === "string" ? params.scent : undefined;
  const sort = typeof params.sort === "string" ? (params.sort as "price-asc" | "price-desc" | "newest") : undefined;

  const [products, categories, scentFamilies] = await Promise.all([
    getShopProducts({ categorySlug: category, scentFamily: scent, q, sort }),
    getCategories(),
    getScentFamilies(),
  ]);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-2">Shop All</h1>
      <p className="text-ink-soft mb-8">{products.length} product{products.length === 1 ? "" : "s"}</p>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <ShopFilters
          categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
          scentFamilies={scentFamilies}
          activeCategory={category}
          activeScent={scent}
          q={q}
          sort={sort}
        />
        <ProductGrid products={products} emptyMessage="No products match those filters yet." />
      </div>
    </div>
  );
}
