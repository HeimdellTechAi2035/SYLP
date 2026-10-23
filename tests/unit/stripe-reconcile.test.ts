import { describe, it, expect, vi, beforeEach } from "vitest";

// Stripe and the database are both faked: this checks the comparison logic only.
vi.mock("@/lib/stripe", () => ({
  stripe: {
    products: { list: vi.fn(), retrieve: vi.fn() },
    prices: { list: vi.fn() },
  },
  stripeConfigured: vi.fn(() => true),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { product: { findMany: vi.fn() } } }));
vi.mock("@/lib/stripe-sync", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stripe-sync")>("@/lib/stripe-sync");
  return { ...actual, syncProductToStripe: vi.fn(), archiveProductInStripe: vi.fn() };
});

process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.co.uk";
process.env.STRIPE_SECRET_KEY = "sk_test_abc";

const { stripe } = await import("@/lib/stripe");
const { prisma } = await import("@/lib/prisma");
const { checkStripeCatalogue } = await import("@/lib/stripe-reconcile");

const page = <T>(data: T[]) => ({ data, has_more: false }) as never;

function product(over: Record<string, unknown> = {}) {
  return {
    id: "p1",
    name: "Preston Patriots Hoodie",
    status: "ACTIVE",
    price: 3500,
    salePrice: null,
    mainImage: "/media/hoodie.jpg",
    shortDescription: "Warm hoodie",
    description: null,
    stripeProductId: "prod_1",
    stripePriceId: "price_1",
    stripeSalePriceId: null,
    variants: [],
    ...over,
  };
}
const sProduct = (over: Record<string, unknown> = {}) => ({
  id: "prod_1",
  active: true,
  name: "Preston Patriots Hoodie",
  description: "Warm hoodie",
  images: ["https://shop.example.co.uk/media/hoodie.jpg"],
  ...over,
});
const sPrice = (over: Record<string, unknown> = {}) => ({
  id: "price_1",
  active: true,
  currency: "gbp",
  unit_amount: 3500,
  product: "prod_1",
  ...over,
});

function setup(products: unknown[], sProducts: unknown[], sPrices: unknown[]) {
  vi.mocked(prisma.product.findMany).mockResolvedValue(products as never);
  vi.mocked(stripe.products.list).mockResolvedValue(page(sProducts));
  vi.mocked(stripe.prices.list).mockResolvedValue(page(sPrices));
}

beforeEach(() => vi.clearAllMocks());

describe("checkStripeCatalogue", () => {
  it("reports a matching product as matching", async () => {
    setup([product()], [sProduct()], [sPrice()]);
    const res = await checkStripeCatalogue();
    expect(res).toMatchObject({ configured: true, mode: "test", checked: 1, matching: 1, problems: [], extras: [] });
  });

  it("flags a product that was never sent to Stripe", async () => {
    setup([product({ stripeProductId: null, stripePriceId: null })], [], []);
    const res = await checkStripeCatalogue();
    expect(res.problems).toEqual([expect.objectContaining({ productId: "p1", problems: ["Not in Stripe yet"], priceProblem: true })]);
  });

  it("flags a price that differs from the shop", async () => {
    setup([product({ price: 3900 })], [sProduct()], [sPrice()]);
    const res = await checkStripeCatalogue();
    expect(res.problems[0].priceProblem).toBe(true);
    expect(res.problems[0].problems[0]).toContain("£35.00");
    expect(res.problems[0].problems[0]).toContain("£39.00");
  });

  it("flags a missing photo using the full live URL", async () => {
    setup([product()], [sProduct({ images: [] })], [sPrice()]);
    const res = await checkStripeCatalogue();
    expect(res.problems[0]).toMatchObject({ problems: ["No photo in Stripe"], priceProblem: false });
  });

  it("flags an archived shop product that's still active in Stripe, and ignores never-synced drafts", async () => {
    setup(
      [product({ status: "ARCHIVED" }), product({ id: "p2", status: "DRAFT", stripeProductId: null })],
      [sProduct()],
      [sPrice()]
    );
    const res = await checkStripeCatalogue();
    expect(res.checked).toBe(1);
    expect(res.problems).toEqual([expect.objectContaining({ productId: "p1", priceProblem: false })]);
  });

  it("checks sizes that have their own price", async () => {
    setup(
      [product({ variants: [{ id: "v1", name: "XXL", priceOverride: 3800, stripePriceId: "price_v1" }] })],
      [sProduct()],
      [sPrice(), sPrice({ id: "price_v1", unit_amount: 3600 })]
    );
    const res = await checkStripeCatalogue();
    expect(res.problems[0].problems[0]).toMatch(/^XXL price is £36.00/);
  });

  it("lists active Stripe products that aren't linked to the shop", async () => {
    setup([product()], [sProduct(), sProduct({ id: "prod_old", name: "Old thing" })], [sPrice()]);
    const res = await checkStripeCatalogue();
    expect(res.extras).toEqual([{ id: "prod_old", name: "Old thing" }]);
  });
});
