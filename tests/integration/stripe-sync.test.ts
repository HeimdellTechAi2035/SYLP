import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";

// The Stripe API boundary is mocked throughout — no test here makes a real
// Stripe call. Database behaviour (what gets read/written) is fully real,
// against the isolated test database.
let priceCounter = 0;
let productCounter = 0;

vi.mock("@/lib/stripe", () => ({
  stripe: {
    products: { create: vi.fn(), update: vi.fn() },
    prices: { create: vi.fn(), update: vi.fn() },
  },
  stripeConfigured: vi.fn(() => true),
}));

const { stripe, stripeConfigured } = await import("@/lib/stripe");
const { prisma } = await import("@/lib/prisma");
const {
  syncProductToStripe,
  syncVariantToStripe,
  archiveProductInStripe,
  isPubliclyReachableImageUrl,
} = await import("@/lib/stripe-sync");

function mockSuccessfulStripe() {
  vi.mocked(stripeConfigured).mockReturnValue(true);
  vi.mocked(stripe.products.create).mockImplementation(async () => ({ id: `prod_test_${++productCounter}` }) as never);
  vi.mocked(stripe.products.update).mockResolvedValue({} as never);
  vi.mocked(stripe.prices.create).mockImplementation(async () => ({ id: `price_test_${++priceCounter}` }) as never);
  vi.mocked(stripe.prices.update).mockResolvedValue({} as never);
}

async function createActiveProduct(overrides: Partial<{ price: number; salePrice: number | null; saleActive: boolean; status: string }> = {}) {
  const id = randomUUID().slice(0, 8);
  return prisma.product.create({
    data: {
      slug: `sync-test-${id}`,
      sku: `SYNC-${id}`,
      name: "Sync Test Product",
      price: 595,
      status: "ACTIVE",
      ...overrides,
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSuccessfulStripe();
});

describe("syncProductToStripe", () => {
  it("1. a published new product creates exactly one Stripe Product", async () => {
    const product = await createActiveProduct();
    const result = await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    expect(result.status).toBe("SYNCED");
    expect(stripe.products.create).toHaveBeenCalledTimes(1);
    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.stripeProductId).toMatch(/^prod_test_/);
    expect(updated.stripeSyncStatus).toBe("SYNCED");
  });

  it("3. retrying an already-synced product does not create a duplicate Stripe Product", async () => {
    const product = await createActiveProduct();
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    await syncProductToStripe(product.id); // retry, nothing changed

    expect(stripe.products.create).toHaveBeenCalledTimes(1);
    expect(stripe.products.update).toHaveBeenCalledTimes(1); // update path taken on 2nd call
  });

  it("4. retrying with no price change does not create a duplicate Stripe Price", async () => {
    const product = await createActiveProduct();
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    await syncProductToStripe(product.id, { priceChanged: false });

    expect(stripe.prices.create).toHaveBeenCalledTimes(1);
  });

  it("5. a description-only change updates the existing Stripe Product, never creates a new one", async () => {
    const product = await createActiveProduct();
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    await prisma.product.update({ where: { id: product.id }, data: { description: "New description" } });
    await syncProductToStripe(product.id, { priceChanged: false, detailsChanged: true });

    expect(stripe.products.create).toHaveBeenCalledTimes(1); // still just the original
    expect(stripe.products.update).toHaveBeenCalledTimes(1);
    const [, updateArgs] = vi.mocked(stripe.products.update).mock.calls[0];
    expect(updateArgs).toMatchObject({ name: "Sync Test Product" });
  });

  it("6 & 7. a price change creates a new Stripe Price and deactivates the old one — future checkout never sees the stale id", async () => {
    const product = await createActiveProduct({ price: 595 });
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    const afterFirst = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    const oldPriceId = afterFirst.stripePriceId;

    await prisma.product.update({ where: { id: product.id }, data: { price: 695 } });
    await syncProductToStripe(product.id, { priceChanged: true });

    expect(stripe.prices.create).toHaveBeenCalledTimes(2);
    expect(stripe.prices.update).toHaveBeenCalledWith(oldPriceId, { active: false });

    const afterSecond = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(afterSecond.stripePriceId).not.toBe(oldPriceId);
  });

  it("8. repricing a product never touches historical order snapshots", async () => {
    const product = await createActiveProduct({ price: 595 });
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    const order = await prisma.order.create({
      data: {
        orderNumber: `HM-SYNC-${randomUUID().slice(0, 8)}`,
        email: "sync-history@example.com",
        firstName: "Sync",
        lastName: "History",
        shippingLine1: "1 Test Street",
        shippingCity: "London",
        shippingPostcode: "SW1A 1AA",
        subtotal: 595,
        total: 595,
        paymentStatus: "PAID",
        fulfilmentStatus: "PAID",
        items: {
          create: [{ productId: product.id, productName: "Sync Test Product", unitPrice: 595, quantity: 1, lineTotal: 595 }],
        },
      },
      include: { items: true },
    });

    await prisma.product.update({ where: { id: product.id }, data: { price: 999 } });
    await syncProductToStripe(product.id, { priceChanged: true });

    const reloadedItem = await prisma.orderItem.findUniqueOrThrow({ where: { id: order.items[0].id } });
    expect(reloadedItem.unitPrice).toBe(595);
    expect(reloadedItem.lineTotal).toBe(595);
  });

  it("9. a draft product does not sync to Stripe at all", async () => {
    const product = await createActiveProduct({ status: "DRAFT" });
    const result = await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    expect(result.status).toBe("NOT_SYNCED");
    expect(stripe.products.create).not.toHaveBeenCalled();
    const reloaded = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(reloaded.stripeProductId).toBeNull();
    expect(reloaded.stripeSyncStatus).toBe("NOT_SYNCED");
  });

  it("11. a Stripe failure is recorded as FAILED, with a sanitised message", async () => {
    const product = await createActiveProduct();
    vi.mocked(stripe.products.create).mockRejectedValue(new Error("Stripe network error: sk_test_abcdef123 was rejected"));

    const result = await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    expect(result.status).toBe("FAILED");
    const reloaded = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(reloaded.stripeSyncStatus).toBe("FAILED");
    expect(reloaded.stripeSyncError).toBeTruthy();
    expect(reloaded.stripeSyncError).not.toContain("sk_test_abcdef123");
    expect(reloaded.stripeSyncError).toContain("[redacted]");
  });

  it("12. retrying after a fixed failure restores SYNCED status", async () => {
    const product = await createActiveProduct();
    vi.mocked(stripe.products.create).mockRejectedValueOnce(new Error("temporary outage"));
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stripeSyncStatus).toBe("FAILED");

    // Stripe is healthy again — mockSuccessfulStripe's implementation is already restored by beforeEach's clearAllMocks + re-mock per test,
    // but within this single test we re-apply success explicitly to simulate "Stripe recovered".
    mockSuccessfulStripe();
    const retryResult = await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    expect(retryResult.status).toBe("SYNCED");
    const reloaded = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(reloaded.stripeSyncStatus).toBe("SYNCED");
    expect(reloaded.stripeSyncError).toBeNull();
  });

  it("16. an integer pence amount is sent to Stripe verbatim — never a floating-point value", async () => {
    const product = await createActiveProduct({ price: 595 }); // £5.95
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    const [args] = vi.mocked(stripe.prices.create).mock.calls[0];
    expect(args.unit_amount).toBe(595);
    expect(Number.isInteger(args.unit_amount)).toBe(true);
  });

  it("sale price gets its own Stripe Price, retired again once the sale price is removed", async () => {
    const product = await createActiveProduct({ price: 1000, salePrice: 700, saleActive: true });
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    const afterSale = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(afterSale.stripeSalePriceId).toMatch(/^price_test_/);
    const salePriceId = afterSale.stripeSalePriceId;

    await prisma.product.update({ where: { id: product.id }, data: { salePrice: null, saleActive: false } });
    await syncProductToStripe(product.id, { priceChanged: true });

    expect(stripe.prices.update).toHaveBeenCalledWith(salePriceId, { active: false });
    const afterRemoval = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(afterRemoval.stripeSalePriceId).toBeNull();
  });

  it("never sends a localhost image URL to Stripe", async () => {
    const product = await createActiveProduct();
    await prisma.product.update({ where: { id: product.id }, data: { mainImage: "http://localhost:3000/brand/logo.jpg" } });
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

    const [args] = vi.mocked(stripe.products.create).mock.calls[0];
    expect(args.images).toBeUndefined();
  });
});

describe("isPubliclyReachableImageUrl", () => {
  it("rejects localhost, 127.0.0.1, http, and relative paths", () => {
    expect(isPubliclyReachableImageUrl("http://localhost:3000/x.jpg")).toBe(false);
    expect(isPubliclyReachableImageUrl("https://127.0.0.1/x.jpg")).toBe(false);
    expect(isPubliclyReachableImageUrl("http://example.com/x.jpg")).toBe(false);
    expect(isPubliclyReachableImageUrl("/uploads/x.jpg")).toBe(false);
    expect(isPubliclyReachableImageUrl(null)).toBe(false);
  });

  it("accepts a real https URL", () => {
    expect(isPubliclyReachableImageUrl("https://images.unsplash.com/photo-123")).toBe(true);
  });
});

describe("syncVariantToStripe", () => {
  it("2. a sellable variant with its own price override creates a Stripe Price", async () => {
    const product = await createActiveProduct();
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    const variant = await prisma.productVariant.create({
      data: { productId: product.id, name: "Large", sku: `SYNC-VAR-${randomUUID().slice(0, 8)}`, priceOverride: 995 },
    });

    const result = await syncVariantToStripe(variant.id, { forceReprice: true });

    expect(result.status).toBe("SYNCED");
    expect(stripe.prices.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ unit_amount: 995, product: expect.stringMatching(/^prod_test_/) })
    );
    const reloaded = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
    expect(reloaded.stripePriceId).toMatch(/^price_test_/);
  });

  it("a variant without a price override is skipped — it inherits the product's Stripe Price", async () => {
    const product = await createActiveProduct();
    const variant = await prisma.productVariant.create({
      data: { productId: product.id, name: "Standard", sku: `SYNC-VAR-${randomUUID().slice(0, 8)}`, priceOverride: null },
    });

    const result = await syncVariantToStripe(variant.id);

    expect(result.status).toBe("NOT_SYNCED");
    expect(stripe.prices.create).not.toHaveBeenCalled();
  });
});

describe("archiveProductInStripe (10)", () => {
  it("deactivates the Stripe Product and its Prices, never deletes them", async () => {
    const product = await createActiveProduct({ price: 1000, salePrice: 700, saleActive: true });
    await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });
    const synced = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });

    const result = await archiveProductInStripe(product.id);

    expect(result.status).toBe("SYNCED");
    expect(stripe.products.update).toHaveBeenCalledWith(synced.stripeProductId, { active: false });
    expect(stripe.prices.update).toHaveBeenCalledWith(synced.stripePriceId, { active: false });
    expect(stripe.prices.update).toHaveBeenCalledWith(synced.stripeSalePriceId, { active: false });
    // No delete API exists on the mocked client at all — proves nothing here could hard-delete.
  });
});
