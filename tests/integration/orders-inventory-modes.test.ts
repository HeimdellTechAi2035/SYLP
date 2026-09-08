import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";

// Proves markOrderPaid's inventory-mode split: MADE_TO_ORDER products have
// no finite stock to track (more is made as orders arrive), so a paid
// order must never touch stockQuantity for them, while TRACK_STOCK products
// keep decrementing exactly as before — including under a duplicate webhook.

const { prisma } = await import("@/lib/prisma");
const { markOrderPaid } = await import("@/lib/orders");

async function product(overrides: { madeToOrder?: boolean; stockQuantity?: number } = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.product.create({
    data: {
      slug: `inv-mode-${id}`,
      sku: `INV-${id}`,
      name: "Inventory Mode Test Product",
      price: 500,
      status: "ACTIVE",
      stockQuantity: overrides.stockQuantity ?? 10,
      madeToOrder: overrides.madeToOrder ?? false,
    },
  });
}

async function paidOrderFor(productId: string, quantity: number) {
  const id = randomUUID().slice(0, 8);
  return prisma.order.create({
    data: {
      orderNumber: `HM-TEST-${id}`,
      email: `inv-mode-${id}@example.com`,
      firstName: "Inv",
      lastName: "Mode",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      shippingCountry: "United Kingdom",
      subtotal: 500 * quantity,
      deliveryAmount: 0,
      total: 500 * quantity,
      paymentStatus: "PENDING",
      fulfilmentStatus: "NEW",
      items: {
        create: [
          {
            productId,
            productName: "Inventory Mode Test Product",
            unitPrice: 500,
            quantity,
            lineTotal: 500 * quantity,
          },
        ],
      },
    },
  });
}

describe("markOrderPaid: inventory mode", () => {
  it("does not decrement stock for a made-to-order product", async () => {
    const p = await product({ madeToOrder: true, stockQuantity: 0 });
    const order = await paidOrderFor(p.id, 3);

    await markOrderPaid(order.id);

    const after = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.stockQuantity).toBe(0);
    const paidOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(paidOrder.paymentStatus).toBe("PAID");
  });

  it("a duplicate webhook delivery for an already-paid made-to-order order is a harmless no-op", async () => {
    const p = await product({ madeToOrder: true, stockQuantity: 0 });
    const order = await paidOrderFor(p.id, 2);

    await markOrderPaid(order.id);
    await markOrderPaid(order.id); // simulates Stripe retrying webhook delivery

    const after = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.stockQuantity).toBe(0); // never went negative, never decremented at all
  });

  it("still decrements stock exactly once for a track-stock product", async () => {
    const p = await product({ madeToOrder: false, stockQuantity: 10 });
    const order = await paidOrderFor(p.id, 3);

    await markOrderPaid(order.id);
    await markOrderPaid(order.id); // duplicate webhook — must not double-decrement

    const after = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.stockQuantity).toBe(7);
  });
});
