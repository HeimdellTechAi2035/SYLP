import ProductCard, { type ProductCardData } from "@/components/product/ProductCard";

export default function ProductGrid({
  products,
  emptyMessage,
}: {
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="text-ink-soft text-sm">{emptyMessage ?? "Nothing to show here yet."}</p>;
  }

  return (
    // flex-wrap + justify-center (not a grid) so a leftover last-row item —
    // an odd product count — centers itself instead of staying pinned to
    // the grid's first column with an empty gap beside it. Each item's
    // width is sized to match what the old grid-cols-N/gap-N would have
    // given it at each breakpoint.
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {products.map((product) => (
        <div
          key={product.slug}
          className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
