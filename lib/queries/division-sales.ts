import { prisma } from "@/lib/prisma";

/** Paid orders that still count as sales (fully refunded ones are left out). */
const SOLD_STATUSES = ["PAID", "PART_REFUNDED"];

export type DivisionSales = {
  divisionId: string | null;
  name: string;
  itemsSold: number;
  orders: number;
  revenue: number; // pence, item prices only (before order-level discounts and delivery)
  lastSaleAt: Date | null;
};

export type SalesPeriod = "7d" | "30d" | "90d" | "all";

export function periodStart(period: SalesPeriod): Date | undefined {
  const days = { "7d": 7, "30d": 30, "90d": 90, all: 0 }[period];
  return days ? new Date(Date.now() - days * 86_400_000) : undefined;
}

/**
 * Sales split by division, from the division each item was recorded against
 * at checkout. An order with items from two divisions counts towards both,
 * each getting only its own items' value.
 */
export async function getDivisionSales(period: SalesPeriod = "all"): Promise<DivisionSales[]> {
  const since = periodStart(period);
  const [items, divisions] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { paymentStatus: { in: SOLD_STATUSES }, ...(since ? { createdAt: { gte: since } } : {}) } },
      select: { divisionId: true, divisionName: true, quantity: true, lineTotal: true, orderId: true, order: { select: { createdAt: true } } },
    }),
    prisma.division.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const rows = new Map<string, DivisionSales & { orderIds: Set<string> }>();
  const row = (id: string | null, name: string) => {
    const k = id ?? "none";
    let r = rows.get(k);
    if (!r) {
      r = { divisionId: id, name, itemsSold: 0, orders: 0, revenue: 0, lastSaleAt: null, orderIds: new Set() };
      rows.set(k, r);
    }
    return r;
  };
  for (const d of divisions) row(d.id, d.name);

  for (const i of items) {
    const known = divisions.find((d) => d.id === i.divisionId);
    const r = row(i.divisionId, known?.name ?? i.divisionName ?? "No division");
    r.itemsSold += i.quantity;
    r.revenue += i.lineTotal;
    r.orderIds.add(i.orderId);
    if (!r.lastSaleAt || i.order.createdAt > r.lastSaleAt) r.lastSaleAt = i.order.createdAt;
  }

  return [...rows.values()]
    .filter((r) => r.divisionId !== null || r.itemsSold > 0)
    .map(({ orderIds, ...r }) => ({ ...r, orders: orderIds.size }));
}
