import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/orders";

async function createTestProduct(overrides: Partial<{ stockQuantity: number }> = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.product.create({
    data: {
      slug: `order-lifecycle-${id}`,
      sku: `OLC-${id}`,
      name: `Order Lifecycle Product ${id}`,
      price: 500,
      stockQuantity: overrides.stockQuantity ?? 10,
      status: "ACTIVE",
    },
  });
}

async function createPendingOrder(opts: {
  productId?: string;
  variantId?: string;
  quantity: number;
  discountCode?: string;
}) {
  const orderNumber = `HM-TEST-${randomUUID().slice(0, 8)}`;
  return prisma.order.create({
    data: {
      orderNumber,
      email: "lifecycle-test@example.com",
      firstName: "Lifecycle",
      lastName: "Test",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "SW1A 1AA",
      subtotal: 500 * opts.quantity,
      total: 500 * opts.quantity,
      discountCode: opts.discountCode ?? null,
      paymentStatus: "PENDING",
      fulfilmentStatus: "NEW",
      items: {
        create: [
          {
            productId: opts.productId ?? null,
            variantId: opts.variantId ?? null,
            productName: "Order Lifecycle Product",
            unitPrice: 500,
            quantity: opts.quantity,
            lineTotal: 500 * opts.quantity,
          },
        ],
      },
    },
  });
}

describe("markOrderPaid", () => {
  it("transitions payment and fulfilment status to PAID", async () => {
    const product = await createTestProduct();
    const order = await createPendingOrder({ productId: product.id, quantity: 2 });

    await markOrderPaid(order.id);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.paymentStatus).toBe("PAID");
    expect(updated.fulfilmentStatus).toBe("PAID");
  });

  it("decrements product stock by the ordered quantity", async () => {
    const product = await createTestProduct({ stockQuantity: 10 });
    const order = await createPendingOrder({ productId: product.id, quantity: 3 });

    await markOrderPaid(order.id);

    const updatedProduct = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updatedProduct.stockQuantity).toBe(7);
  });

  it("decrements variant stock (not product stock) when the order line is for a variant", async () => {
    const product = await createTestProduct({ stockQuantity: 10 });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: "Test Variant",
        sku: `OLC-VAR-${randomUUID().slice(0, 8)}`,
        stockQuantity: 5,
      },
    });
    const order = await createPendingOrder({ variantId: variant.id, quantity: 2 });

    await markOrderPaid(order.id);

    const updatedVariant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
    const updatedProduct = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updatedVariant.stockQuantity).toBe(3);
    expect(updatedProduct.stockQuantity).toBe(10); // untouched
  });

  it("is idempotent — calling it twice does not double-decrement stock", async () => {
    const product = await createTestProduct({ stockQuantity: 10 });
    const order = await createPendingOrder({ productId: product.id, quantity: 4 });

    await markOrderPaid(order.id);
    await markOrderPaid(order.id); // simulates a duplicate Stripe webhook delivery

    const updatedProduct = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updatedProduct.stockQuantity).toBe(6); // decremented once, not twice
  });

  it("increments the discount's usage counter exactly once, even if called twice", async () => {
    const code = `OLCDISC${randomUUID().slice(0, 6).toUpperCase()}`;
    await prisma.discount.create({
      data: { code, type: "PERCENTAGE", value: 10, timesUsed: 0, isActive: true },
    });
    const product = await createTestProduct();
    const order = await createPendingOrder({ productId: product.id, quantity: 1, discountCode: code });

    await markOrderPaid(order.id);
    await markOrderPaid(order.id);

    const updatedDiscount = await prisma.discount.findUniqueOrThrow({ where: { code } });
    expect(updatedDiscount.timesUsed).toBe(1);
  });

  it("does nothing for a non-existent order id (no throw)", async () => {
    await expect(markOrderPaid("does-not-exist")).resolves.toBeUndefined();
  });
});
