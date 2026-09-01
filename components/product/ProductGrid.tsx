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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
