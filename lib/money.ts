/** All prices are stored in pence (integers) to avoid floating-point rounding errors. */

export function formatPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}
