/**
 * Packaging is charged once per ORDER, never once per line item — a
 * multi-item order still realistically ships in a single parcel. This picks
 * the first assigned profile found across the order's items (variant
 * override takes priority over its parent product) rather than summing
 * every item's own packaging. Returns 0 (not a fabricated guess) when
 * nothing in the order has a packaging profile configured yet.
 */
export function resolveOrderPackagingCost(
  items: { variant: { packagingProfile: { cost: number } | null } | null; product: { packagingProfile: { cost: number } | null } }[]
): number {
  for (const item of items) {
    const cost = item.variant?.packagingProfile?.cost ?? item.product.packagingProfile?.cost;
    if (cost != null) return cost;
  }
  return 0;
}
