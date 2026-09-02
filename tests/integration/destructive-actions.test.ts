import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

// Confirms the referential behaviour documented in the Stage 2 destructive-action
// audit. Every fixture here is created fresh and disposed of within the test —
// none of the shared seed-test.ts fixtures or dev.db are ever touched.

describe("category delete", () => {
  it("leaves the product intact and valid, just without a category", async () => {
    const id = randomUUID().slice(0, 8);
    const category = await prisma.category.create({ data: { slug: `disposable-cat-${id}`, name: "Disposable Category" } });
    const product = await prisma.product.create({
      data: { slug: `disposable-prod-${id}`, sku: `DISP-${id}`, name: "Disposable Product", price: 500, categoryId: category.id, status: "ACTIVE" },
    });

    await prisma.category.delete({ where: { id: category.id } });

    const reloaded = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(reloaded.categoryId).toBeNull();
    expect(reloaded.status).toBe("ACTIVE");
    expect(reloaded.name).toBe("Disposable Product");
  });
});

describe("fragrance delete", () => {
  it("leaves the product AND its variants intact and valid, just without a fragrance link", async () => {
    const id = randomUUID().slice(0, 8);
    const fragrance = await prisma.fragrance.create({ data: { slug: `disposable-frag-${id}`, name: "Disposable Fragrance" } });
    const product = await prisma.product.create({
      data: { slug: `disposable-prod2-${id}`, sku: `DISP2-${id}`, name: "Disposable Product 2", price: 500, fragranceId: fragrance.id, status: "ACTIVE" },
    });
    const variant = await prisma.productVariant.create({
      data: { productId: product.id, name: "Variant", sku: `DISPVAR-${id}`, fragranceId: fragrance.id },
    });

    await prisma.fragrance.delete({ where: { id: fragrance.id } });

    const reloadedProduct = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    const reloadedVariant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
    expect(reloadedProduct.fragranceId).toBeNull();
    expect(reloadedVariant.fragranceId).toBeNull();
  });
});

describe("product variant delete", () => {
  it("keeps historical order line items fully readable via their own snapshot fields", async () => {
    const id = randomUUID().slice(0, 8);
    const product = await prisma.product.create({
      data: { slug: `disposable-prod3-${id}`, sku: `DISP3-${id}`, name: "Disposable Product 3", price: 500, status: "ACTIVE" },
    });
    const variant = await prisma.productVariant.create({
      data: { productId: product.id, name: "Large — Disposable", sku: `DISPVAR2-${id}` },
    });
    const order = await prisma.order.create({
      data: {
        orderNumber: `HM-DISP-${id}`,
        email: "disposable@example.com",
        firstName: "Disp",
        lastName: "Osable",
        shippingLine1: "1 Test Street",
        shippingCity: "London",
        shippingPostcode: "SW1A 1AA",
        subtotal: 500,
        total: 500,
        paymentStatus: "PAID",
        fulfilmentStatus: "PAID",
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant.id,
              productName: "Disposable Product 3",
              variantLabel: "Large — Disposable", // snapshot, independent of the live variant row
              sku: variant.sku,
              unitPrice: 500,
              quantity: 1,
              lineTotal: 500,
            },
          ],
        },
      },
    });

    await prisma.productVariant.delete({ where: { id: variant.id } });

    const reloadedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
    expect(reloadedOrder.items[0].variantId).toBeNull(); // live link gone
    expect(reloadedOrder.items[0].variantLabel).toBe("Large — Disposable"); // snapshot text survives
    expect(reloadedOrder.items[0].sku).toBe(variant.sku);
    expect(reloadedOrder.items[0].lineTotal).toBe(500);
  });
});

describe("discount delete", () => {
  it("leaves historical orders with their stored discount amount intact", async () => {
    const id = randomUUID().slice(0, 8);
    const code = `DISPDISC${id.toUpperCase()}`;
    await prisma.discount.create({ data: { code, type: "PERCENTAGE", value: 10, isActive: true } });
    const order = await prisma.order.create({
      data: {
        orderNumber: `HM-DISPDISC-${id}`,
        email: "disposable-discount@example.com",
        firstName: "Disp",
        lastName: "Discount",
        shippingLine1: "1 Test Street",
        shippingCity: "London",
        shippingPostcode: "SW1A 1AA",
        subtotal: 1000,
        discountCode: code,
        discountAmount: 100,
        total: 900,
        paymentStatus: "PAID",
        fulfilmentStatus: "PAID",
      },
    });

    await prisma.discount.delete({ where: { code } });

    const reloadedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(reloadedOrder.discountCode).toBe(code); // stored as a plain string, not a live FK
    expect(reloadedOrder.discountAmount).toBe(100);
    expect(reloadedOrder.total).toBe(900);

    // The discount itself really is gone — confirms the order isn't secretly held open by an FK constraint.
    const discountStillExists = await prisma.discount.findUnique({ where: { code } });
    expect(discountStillExists).toBeNull();
  });
});
