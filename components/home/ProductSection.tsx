import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import SectionHeading from "@/components/home/SectionHeading";
import type { ProductCardData } from "@/components/product/ProductCard";

export default function ProductSection({
  products,
  eyebrow,
  title,
  viewAllHref,
  emptyMessage,
}: {
  products: ProductCardData[];
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
  emptyMessage?: string;
}) {
  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} />
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-semibold text-rose-dark hover:text-ink shrink-0 mb-8">
            View all &rarr;
          </Link>
        )}
      </div>
      <ProductGrid products={products} emptyMessage={emptyMessage} />
    </section>
  );
}
