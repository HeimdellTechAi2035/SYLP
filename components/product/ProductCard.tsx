import Link from "next/link";
import Image from "next/image";
import Price from "@/components/ui/Price";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export type ProductCardData = {
  slug: string;
  name: string;
  mainImage: string | null;
  price: number;
  salePrice: number | null;
  saleActive: boolean;
  isNew: boolean;
  bestSeller: boolean;
  stockQuantity: number;
  continueSellingOOS: boolean;
  madeToOrder: boolean;
  fragrance?: { name: string } | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stockQuantity <= 0 && !product.continueSellingOOS && !product.madeToOrder;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white/60 border border-ink/5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-square bg-blush">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <PlaceholderImage />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <Badge>New</Badge>}
          {product.bestSeller && <Badge tone="gold">Best Seller</Badge>}
          {product.saleActive && product.salePrice != null && <Badge tone="rose">Sale</Badge>}
        </div>
        {outOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/80 text-cream text-xs text-center py-1.5 font-medium">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1">
        {product.fragrance?.name && (
          <span className="text-xs uppercase tracking-wide text-rose-dark font-medium">
            {product.fragrance.name}
          </span>
        )}
        <h3 className="font-medium text-ink leading-snug">{product.name}</h3>
        <div className="mt-1">
          <Price price={product.price} salePrice={product.salePrice} saleActive={product.saleActive} size="sm" />
        </div>
        {product.madeToOrder && (
          <span className="text-[11px] text-ink-soft mt-0.5">Made to order</span>
        )}
      </div>
    </Link>
  );
}

function Badge({ children, tone = "sage" }: { children: React.ReactNode; tone?: "sage" | "gold" | "rose" }) {
  const toneClasses = {
    sage: "bg-sage text-white",
    gold: "bg-gold text-ink",
    rose: "bg-rose-dark text-white",
  }[tone];

  return (
    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full ${toneClasses}`}>
      {children}
    </span>
  );
}
