/**
 * Estimated order margin — deliberately never fabricated. If any line item's
 * product cost price is missing (deleted product, or cost price never
 * entered by the admin), this returns `complete: false` rather than
 * treating an unknown cost as zero and inflating the estimate.
 *
 * Uses Order.total (which includes what the customer paid for delivery) as
 * revenue, matching how the money actually arrived — deliverable-free orders
 * still get a correct margin because estimatedPostageCost/packagingCost are
 * snapshotted independently of what the customer was charged.
 */
export function estimateOrderMargin(
  order: { total: number; estimatedPostageCost: number; packagingCost: number },
  items: { quantity: number; product: { costPrice: number | null } | null }[]
): { complete: boolean; marginPence: number | null } {
  if (items.length === 0) return { complete: false, marginPence: null };

  let totalProductCost = 0;
  for (const item of items) {
    if (item.product?.costPrice == null) return { complete: false, marginPence: null };
    totalProductCost += item.product.costPrice * item.quantity;
  }

  const marginPence = order.total - totalProductCost - order.estimatedPostageCost - order.packagingCost;
  return { complete: true, marginPence };
}
