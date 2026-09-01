import { formatPence } from "@/lib/money";

export default function Price({
  price,
  salePrice,
  saleActive,
  size = "md",
}: {
  price: number;
  salePrice?: number | null;
  saleActive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const onSale = saleActive && salePrice != null && salePrice < price;
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";

  if (!onSale) {
    return <span className={`font-semibold ${textSize}`}>{formatPence(price)}</span>;
  }

  return (
    <span className={`flex items-baseline gap-2 ${textSize}`}>
      <span className="font-semibold text-rose-dark">{formatPence(salePrice!)}</span>
      <span className="text-ink-soft line-through text-sm">{formatPence(price)}</span>
    </span>
  );
}
