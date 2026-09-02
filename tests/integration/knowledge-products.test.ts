import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";

// Proves the product knowledge layer reads live data at call time — no
// separate copy to fall out of sync, no caching to invalidate. An admin
// save is reflected on the very next call, proven directly here.

const { prisma } = await import("@/lib/prisma");
const { getProductKnowledge, getProductKnowledgeBySlug } = await import("@/lib/knowledge/products");

async function disposableProduct(overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.product.create({
    data: {
      slug: `knowledge-test-${id}`,
      sku: `KN-${id}`,
      name: "Knowledge Test Product",
      price: 450,
      status: "ACTIVE",
      stockQuantity: 10,
      ...overrides,
    },
  });
}

describe("1. a published product can be answered", () => {
  it("appears in getProductKnowledge with its current price", async () => {
    const product = await disposableProduct({ name: "Findable Product" });
    const knowledge = await getProductKnowledge();
    const found = knowledge.find((p) => p.id === product.id);
    expect(found).toBeDefined();
    expect(found!.currentPrice).toBe(450);
  });
});

describe("2. a changed product price is immediately reflected", () => {
  it("reflects the new price on the very next call, no rebuild or cache clear needed", async () => {
    const product = await disposableProduct({ price: 450 });
    const before = await getProductKnowledgeBySlug(product.slug);
    expect(before!.currentPrice).toBe(450);

    await prisma.product.update({ where: { id: product.id }, data: { price: 500 } });

    const after = await getProductKnowledgeBySlug(product.slug);
    expect(after!.currentPrice).toBe(500);
  });
});

describe("3. sale price is correctly reflected", () => {
  it("uses the sale price when saleActive is true, and the regular price otherwise", async () => {
    const product = await disposableProduct({ price: 1000, salePrice: 700, saleActive: true });
    const onSale = await getProductKnowledgeBySlug(product.slug);
    expect(onSale!.currentPrice).toBe(700);
    expect(onSale!.saleActive).toBe(true);

    await prisma.product.update({ where: { id: product.id }, data: { saleActive: false } });
    const notOnSale = await getProductKnowledgeBySlug(product.slug);
    expect(notOnSale!.currentPrice).toBe(1000);
  });
});

describe("4. an added variant appears in answers", () => {
  it("a newly created variant shows up on the next knowledge read", async () => {
    const product = await disposableProduct({});
    const before = await getProductKnowledgeBySlug(product.slug);
    expect(before!.variants).toHaveLength(0);

    await prisma.productVariant.create({
      data: { productId: product.id, name: "Large", sku: `${product.sku}-L`, size: "Large", stockQuantity: 5 },
    });

    const after = await getProductKnowledgeBySlug(product.slug);
    expect(after!.variants).toHaveLength(1);
    expect(after!.variants[0].size).toBe("Large");
  });
});

describe("5. an archived product disappears", () => {
  it("is excluded from knowledge the moment its status changes to ARCHIVED", async () => {
    const product = await disposableProduct({});
    expect(await getProductKnowledgeBySlug(product.slug)).not.toBeNull();

    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });

    expect(await getProductKnowledgeBySlug(product.slug)).toBeNull();
    const all = await getProductKnowledge();
    expect(all.find((p) => p.id === product.id)).toBeUndefined();
  });
});

describe("6. a draft product is never exposed", () => {
  it("a DRAFT product never appears in knowledge, even by direct slug lookup", async () => {
    const product = await disposableProduct({ status: "DRAFT" });
    expect(await getProductKnowledgeBySlug(product.slug)).toBeNull();
    const all = await getProductKnowledge();
    expect(all.find((p) => p.id === product.id)).toBeUndefined();
  });
});

describe("15 (partial). admin-only fields never appear in public product knowledge", () => {
  it("costPrice, supplierManufacturerDetails and batchReference are not reachable through PublicProductKnowledge", async () => {
    const product = await disposableProduct({
      costPrice: 150,
      supplierManufacturerDetails: "Acme Wax Supplies Ltd, internal account #4471",
      batchReference: "BATCH-2026-INTERNAL-004",
    });
    const knowledge = await getProductKnowledgeBySlug(product.slug);
    expect(knowledge).not.toBeNull();
    const serialized = JSON.stringify(knowledge);
    expect(serialized).not.toContain("150");
    expect(serialized).not.toContain("Acme Wax Supplies");
    expect(serialized).not.toContain("BATCH-2026-INTERNAL-004");
    // Also verify at the type level that no such keys exist on the object at all.
    expect(Object.keys(knowledge as object)).not.toContain("costPrice");
    expect(Object.keys(knowledge as object)).not.toContain("supplierManufacturerDetails");
    expect(Object.keys(knowledge as object)).not.toContain("batchReference");
  });
});

describe("22. product link uses the correct current slug", () => {
  it("getProductKnowledgeBySlug returns the same slug it was queried with, unaffected by a later rename", async () => {
    const product = await disposableProduct({ slug: `link-test-${randomUUID().slice(0, 8)}` });
    const knowledge = await getProductKnowledgeBySlug(product.slug);
    expect(knowledge!.slug).toBe(product.slug);

    const newSlug = `renamed-${randomUUID().slice(0, 8)}`;
    await prisma.product.update({ where: { id: product.id }, data: { slug: newSlug } });

    // The old slug no longer resolves — a stale link would correctly 404, not point at wrong content.
    expect(await getProductKnowledgeBySlug(product.slug)).toBeNull();
    const renamed = await getProductKnowledgeBySlug(newSlug);
    expect(renamed!.slug).toBe(newSlug);
  });
});

describe("23. no caching means no staleness — direct database lookup is used on every call", () => {
  it("two consecutive calls immediately after a write both see the new value", async () => {
    const product = await disposableProduct({ price: 200 });
    await prisma.product.update({ where: { id: product.id }, data: { price: 999 } });

    const first = await getProductKnowledgeBySlug(product.slug);
    const second = await getProductKnowledgeBySlug(product.slug);
    expect(first!.currentPrice).toBe(999);
    expect(second!.currentPrice).toBe(999);
  });
});
