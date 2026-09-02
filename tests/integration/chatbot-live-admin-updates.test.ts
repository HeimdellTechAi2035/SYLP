import { describe, it, expect, afterEach } from "vitest";
import { randomUUID } from "crypto";

// Proves the fixes from the previous stage hold through the actual chatbot
// entry point (askChatbot), not just the underlying knowledge functions —
// an admin save must be reflected in the bot's own answer text immediately.

const { prisma } = await import("@/lib/prisma");
const { askChatbot } = await import("@/lib/knowledge/chat");

const createdProductIds: string[] = [];
afterEach(async () => {
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds.splice(0) } } });
});

async function disposableProduct(overrides: Record<string, unknown> = {}) {
  const id = randomUUID().slice(0, 8);
  const product = await prisma.product.create({
    data: {
      slug: `live-test-${id}`,
      sku: `LIVE-${id}`,
      name: "Amber Nights Wax Melt",
      price: 450,
      status: "ACTIVE",
      stockQuantity: 10,
      productType: "WAX_MELT",
      ...overrides,
    },
  });
  createdProductIds.push(product.id);
  return product;
}

describe("9 & 10. sale price state through the chatbot", () => {
  it("an active sale is reflected in the bot's answer", async () => {
    const product = await disposableProduct({ price: 1000, salePrice: 700, saleActive: true });
    const response = await askChatbot(`how much is ${product.name}`);
    expect(response.text).toContain("£7.00");
    expect(response.text).toContain("on sale");
  });

  it("an inactive/expired sale (saleActive false) is never advertised — full price only", async () => {
    // The schema has no date-based sale window, only an on/off flag — an
    // admin turning a sale off (whether it lapsed or was scheduled and never
    // activated) is the same state, and must show the regular price only.
    const product = await disposableProduct({ price: 1000, salePrice: 700, saleActive: false });
    const response = await askChatbot(`how much is ${product.name}`);
    expect(response.text).toContain("£10.00");
    expect(response.text).not.toContain("on sale");
    expect(response.text).not.toContain("£7.00");
  });
});

describe("11. an admin price change is reflected in the bot's answer immediately", () => {
  it("asks before, admin changes price, asks again — new price appears with no rebuild", async () => {
    const product = await disposableProduct({ price: 450 });
    const before = await askChatbot(`how much is ${product.name}`);
    expect(before.text).toContain("£4.50");

    await prisma.product.update({ where: { id: product.id }, data: { price: 500 } });

    const after = await askChatbot(`how much is ${product.name}`);
    expect(after.text).toContain("£5.00");
    expect(after.text).not.toContain("£4.50");
  });
});

describe("12. an admin-added variant is reflected in the bot's answer immediately", () => {
  it("asks about sizes before (none), admin adds a Large variant, asks again", async () => {
    const product = await disposableProduct({});
    const before = await askChatbot(`what size is ${product.name}`);
    expect(before.text).toContain("one size only");

    await prisma.productVariant.create({
      data: { productId: product.id, name: "Large", sku: `${product.sku}-L`, size: "Large", stockQuantity: 5 },
    });

    const after = await askChatbot(`what size is ${product.name}`);
    expect(after.text).toContain("Large");
  });
});

describe("14. archiving a product immediately stops the chatbot exposing it", () => {
  it("answers before archiving, refuses to name it after", async () => {
    const product = await disposableProduct({ name: "Amber Nights Wax Melt" });
    const before = await askChatbot(`is ${product.name} available`);
    expect(before.text).toContain(product.name);

    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });

    const after = await askChatbot(`is ${product.name} available`);
    expect(after.text).not.toContain(product.name);
    expect(after.resolved).toBe(false);
  });
});
