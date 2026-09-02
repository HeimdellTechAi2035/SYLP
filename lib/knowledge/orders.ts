import { prisma } from "@/lib/prisma";
import type { Order, OrderItem } from "@prisma/client";

export type OrderKnowledge = {
  orderNumber: string;
  fulfilmentStatus: string;
  paymentStatus: string;
  total: number;
  items: { productName: string; variantLabel: string | null; quantity: number }[];
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
};

function toKnowledge(order: Order & { items: OrderItem[] }): OrderKnowledge {
  return {
    orderNumber: order.orderNumber,
    fulfilmentStatus: order.fulfilmentStatus,
    paymentStatus: order.paymentStatus,
    total: order.total,
    items: order.items.map((i) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity })),
    trackingCarrier: order.trackingCarrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    createdAt: order.createdAt,
  };
}

/**
 * Orders belonging to an AUTHENTICATED customer only. `customerId` must come
 * from a verified session (getCustomerSession()), never from anything the
 * chat message itself claims — knowing someone's order number or email is
 * never sufficient on its own to see it this way.
 */
export async function getOrderKnowledgeForCustomer(customerId: string, orderNumber?: string): Promise<OrderKnowledge[]> {
  const orders = await prisma.order.findMany({
    where: { customerId, ...(orderNumber ? { orderNumber } : {}) },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: orderNumber ? 1 : 5,
  });
  return orders.map(toKnowledge);
}

/**
 * Guest order lookup — mirrors the existing /track-order page's own
 * verification exactly: both the order number AND the matching email are
 * required. An order number alone (however it was obtained) is never
 * sufficient to reveal anything about an order.
 */
export async function getOrderKnowledgeForGuest(orderNumber: string, email: string): Promise<OrderKnowledge | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim(), email: { equals: email.trim() } },
    include: { items: true },
  });
  return order ? toKnowledge(order) : null;
}
