/**
 * The single source of truth for "what does this product/variant actually
 * cost right now" — used by the cart, checkout, and Stripe catalogue sync.
 * Keeping this in one place means the price Stripe's catalogue mirrors can
 * never drift from the price checkout actually charges.
 *
 * A variant with its own priceOverride is a fixed price point, independent of
 * the product's sale state. A variant without one inherits the product's
 * current price — including any active sale.
 */
export function unitPriceFor(
  product: { price: number; salePrice: number | null; saleActive: boolean },
  variant?: { priceOverride: number | null } | null
): number {
  if (variant?.priceOverride != null) return variant.priceOverride;
  if (product.saleActive && product.salePrice != null) return product.salePrice;
  return product.price;
}
