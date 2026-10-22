import { prisma } from "@/lib/prisma";

/** Orders that were actually paid for (including ones later refunded). */
export const PAID_STATUSES = ["PAID", "PART_REFUNDED", "REFUNDED"];

export type Buyer = {
  key: string; // lower-cased email - one buyer per email address
  name: string;
  email: string;
  phone: string | null;
  address: string;
  postcode: string;
  orderCount: number;
  totalSpent: number; // pence
  firstOrderAt: Date;
  lastOrderAt: Date;
  divisions: string[];
  hasAccount: boolean;
  orders: { id: string; orderNumber: string; total: number; createdAt: Date; status: string; items: string }[];
};

/**
 * Everyone who has bought something, guests and account holders alike,
 * built from paid orders (an account is optional at checkout, so the
 * Customer table alone misses most buyers). Contact details come from
 * each buyer's most recent order.
 */
export async function getBuyers(opts: { q?: string; division?: string } = {}): Promise<Buyer[]> {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: { in: PAID_STATUSES } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      shippingLine1: true,
      shippingLine2: true,
      shippingCity: true,
      shippingCounty: true,
      shippingPostcode: true,
      total: true,
      createdAt: true,
      fulfilmentStatus: true,
      customerId: true,
      items: {
        select: {
          productName: true,
          variantLabel: true,
          quantity: true,
          product: { select: { division: { select: { name: true, slug: true } } } },
        },
      },
    },
  });

  const byEmail = new Map<string, Buyer & { divisionSlugs: Set<string> }>();
  for (const o of orders) {
    const key = o.email.trim().toLowerCase();
    let b = byEmail.get(key);
    if (!b) {
      // first seen = most recent order, so these are the latest contact details
      b = {
        key,
        name: `${o.firstName} ${o.lastName}`.trim(),
        email: o.email.trim(),
        phone: o.phone,
        address: [o.shippingLine1, o.shippingLine2, o.shippingCity, o.shippingCounty].filter(Boolean).join(", "),
        postcode: o.shippingPostcode,
        orderCount: 0,
        totalSpent: 0,
        firstOrderAt: o.createdAt,
        lastOrderAt: o.createdAt,
        divisions: [],
        divisionSlugs: new Set(),
        hasAccount: false,
        orders: [],
      };
      byEmail.set(key, b);
    }
    if (!b.phone && o.phone) b.phone = o.phone;
    if (o.customerId) b.hasAccount = true;
    b.orderCount += 1;
    b.totalSpent += o.total;
    b.firstOrderAt = o.createdAt;
    for (const i of o.items) {
      const d = i.product?.division;
      if (d && !b.divisionSlugs.has(d.slug)) {
        b.divisionSlugs.add(d.slug);
        b.divisions.push(d.name);
      }
    }
    b.orders.push({
      id: o.id,
      orderNumber: o.orderNumber,
      total: o.total,
      createdAt: o.createdAt,
      status: o.fulfilmentStatus,
      items: o.items.map((i) => `${i.quantity} × ${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""}`).join(", "),
    });
  }

  let buyers = [...byEmail.values()];
  if (opts.division) buyers = buyers.filter((b) => b.divisionSlugs.has(opts.division!));
  if (opts.q) {
    const q = opts.q.trim().toLowerCase();
    buyers = buyers.filter((b) =>
      [b.name, b.email, b.phone ?? "", b.postcode, b.address].some((v) => v.toLowerCase().includes(q))
    );
  }
  return buyers.map(({ divisionSlugs: _unused, ...b }) => {
    void _unused;
    return b;
  });
}
