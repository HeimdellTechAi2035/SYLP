import { describe, it, expect, afterEach } from "vitest";
import { randomUUID } from "crypto";

// Real-world QA found several precision gaps in the deterministic matcher
// (fixed in lib/knowledge/chat.ts) — these tests lock in the fixes: typo/
// informal tolerance, ambiguity handling, session-local conversation
// context, multi-product shortlists, and quantity-aware pricing.

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
      slug: `lang-test-${id}`,
      sku: `LANG-${id}`,
      name: "Blueberry Bliss Wax Melt",
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

describe("1 & 2. typo and informal phrasing still resolve to the right price", () => {
  it("a typo'd price question resolves via the shorthand-expansion + fuzzy matcher", async () => {
    const product = await disposableProduct({ name: "Blueberry Bliss Wax Melt" });
    const response = await askChatbot("how muchs the blueberry one");
    expect(response.text).toContain("£4.50");
    expect(response.subjectProductSlug).toBe(product.slug);
  });

  it("informal 'u got X' phrasing is treated as a discovery/availability question", async () => {
    await disposableProduct({ name: "Blueberry Bliss Wax Melt" });
    const response = await askChatbot("u got blueberry");
    expect(response.text).toContain("Blueberry Bliss Wax Melt");
    expect(response.text).toContain("£4.50");
  });
});

describe("3. delivery typo still resolves", () => {
  it("'how mch is delivery' expands 'mch' -> 'much' and answers correctly", async () => {
    const response = await askChatbot("how mch is delivery");
    expect(response.resolved).toBe(true);
    expect(response.text).toMatch(/£|free/i);
  });
});

describe("4. a paraphrased returns question is treated as a policy question, not silently dropped", () => {
  it("'can i send it back' is routed to the returns/refunds policy path (answer depends on whether one is published)", async () => {
    const response = await askChatbot("can i send it back");
    // Whatever the actual answer, it must be the policy path's own honest
    // response — never a coincidental unrelated FAQ/product match.
    expect(response.links.some((l) => l.href.startsWith("/legal/") || l.href === "/contact")).toBe(true);
  });
});

describe("5. an ambiguous pronoun-only question with no prior context asks for clarification, never guesses", () => {
  it("'how much is it' with a brand new conversation asks which product", async () => {
    const response = await askChatbot("how much is it");
    expect(response.text.toLowerCase()).toContain("which product");
    expect(response.text).not.toMatch(/£\d/); // never invents a price for an unnamed product
  });
});

describe("6. conversation context resolves a short follow-up 'it'", () => {
  it("naming a product then asking 'how much is it?' and 'is it made to order?' resolves via context", async () => {
    const product = await disposableProduct({ name: "Blueberry Bliss Wax Melt", madeToOrder: true, productionTimeDays: 3 });

    const first = await askChatbot("how much is blueberry bliss");
    expect(first.subjectProductSlug).toBe(product.slug);

    const priceFollowUp = await askChatbot("how much is it?", { lastProductSlug: first.subjectProductSlug });
    expect(priceFollowUp.text).toContain("£4.50");

    const madeToOrderFollowUp = await askChatbot("is it made to order?", { lastProductSlug: first.subjectProductSlug });
    expect(madeToOrderFollowUp.text).toContain("made to order");
  });

  it("context from one call is never silently reused unless the caller explicitly passes it forward (no server-side memory)", async () => {
    const product = await disposableProduct({ name: "Blueberry Bliss Wax Melt" });
    await askChatbot("how much is blueberry bliss", {});
    // A fresh call with NO context must not somehow "remember" the previous
    // call — context lives only in whatever the caller explicitly supplies.
    const response = await askChatbot("how much is it?");
    expect(response.text.toLowerCase()).toContain("which product");
    expect(response.text).not.toContain(product.name);
  });
});

describe("7. multiple matching products return a shortlist, never an arbitrary pick", () => {
  it("two products sharing a fragrance name both appear, with price and a link each", async () => {
    const a = await disposableProduct({ name: "Rosewood Wax Melt", productType: "WAX_MELT", price: 450 });
    const b = await disposableProduct({ name: "Rosewood Candle", productType: "CANDLE", price: 1650, slug: `lang-test-${randomUUID().slice(0, 8)}`, sku: `LANG-${randomUUID().slice(0, 8)}` });

    const response = await askChatbot("what rosewood products do you have");
    expect(response.text).toContain(a.name);
    expect(response.text).toContain(b.name);
    expect(response.links.length).toBe(2);
  });
});

describe("8. a quantity price question multiplies the trusted server-side unit price", () => {
  it("'how much for 3 blueberry ones' returns unit price x 3, respecting sale price if active", async () => {
    await disposableProduct({ name: "Blueberry Bliss Wax Melt", price: 450 });
    const response = await askChatbot("how much for 3 blueberry ones");
    expect(response.text).toContain("£4.50 each");
    expect(response.text).toContain("£13.50"); // 450 * 3 = 1350p
  });

  it("respects the current sale price, not the regular price, when calculating a quantity total", async () => {
    await disposableProduct({ name: "Blueberry Bliss Wax Melt", price: 1000, salePrice: 700, saleActive: true });
    const response = await askChatbot("how much for 2 blueberry ones");
    expect(response.text).toContain("£7.00 each");
    expect(response.text).toContain("£14.00"); // 700 * 2, not 1000 * 2
  });
});
