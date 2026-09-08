import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

// Proves the postage/packaging cost snapshot: computed server-side,
// immutable once an Order exists, present even under free delivery, and
// never dependent on a product's inventory mode.

const cookieStore = createMockCookieStore();

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { create: vi.fn() } }, coupons: { create: vi.fn() } },
  stripeConfigured: vi.fn(() => true),
}));

const { prisma } = await import("@/lib/prisma");
const { startCheckout } = await import("@/lib/actions/checkout");
const { stripe } = await import("@/lib/stripe");

function checkoutFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    email: `fulfilment-${randomUUID().slice(0, 8)}@example.com`,
    firstName: "Fulfilment",
    lastName: "Test",
    shippingLine1: "1 Test Street",
    shippingCity: "London",
    shippingPostcode: "SW1A 1AA",
    shippingCountry: "United Kingdom",
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) fd.set(k, v);
  return fd;
}

async function seedCartWithProductId(productId: string, quantity: number) {
  const token = randomUUID();
  const cart = await prisma.cart.create({ data: { token } });
  await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  cookieStore.set("hbm_cart", token);
}

// Every zone/rate/profile this file creates uses this prefix so cleanup
// can't accidentally touch the shared seed-test.ts fixture ("Test UK Zone").
const PREFIX = "fulfilment-test";
const createdZoneIds: string[] = [];
const createdRateIds: string[] = [];
const createdProfileIds: string[] = [];
const createdProductIds: string[] = [];

async function isolatedZone(opts: { postageCost?: number; price?: number; freeThreshold?: number | null }) {
  const suffix = randomUUID().slice(0, 8);
  let rateId: string | null = null;
  if (opts.postageCost != null) {
    const rate = await prisma.postageRate.create({ data: { name: `${PREFIX}-rate-${suffix}`, cost: opts.postageCost } });
    createdRateIds.push(rate.id);
    rateId = rate.id;
  }
  const country = `${PREFIX}-country-${suffix}`;
  const zone = await prisma.deliveryZone.create({
    data: {
      name: `${PREFIX}-zone-${suffix}`,
      countries: country,
      price: opts.price ?? 295,
      freeThreshold: opts.freeThreshold ?? null,
      isActive: true,
      postageRateId: rateId,
    },
  });
  createdZoneIds.push(zone.id);
  return { zone, country };
}

async function isolatedPackagingProfile(cost: number) {
  const profile = await prisma.packagingProfile.create({ data: { name: `${PREFIX}-profile-${randomUUID().slice(0, 8)}`, cost } });
  createdProfileIds.push(profile.id);
  return profile;
}

async function disposableProduct(opts: { madeToOrder?: boolean; packagingProfileId?: string | null }) {
  const id = randomUUID().slice(0, 8);
  const product = await prisma.product.create({
    data: {
      slug: `${PREFIX}-product-${id}`,
      sku: `${PREFIX}-${id}`,
      name: "Fulfilment Test Product",
      price: 1000,
      status: "ACTIVE",
      stockQuantity: opts.madeToOrder ? 0 : 10,
      madeToOrder: opts.madeToOrder ?? false,
      packagingProfileId: opts.packagingProfileId ?? null,
    },
  });
  createdProductIds.push(product.id);
  return product;
}

beforeEach(() => {
  vi.mocked(stripe.checkout.sessions.create).mockReset();
  vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ id: "sess_fulfil", url: "https://stripe.test/fulfil" } as never);
});

afterEach(async () => {
  await prisma.deliveryZone.deleteMany({ where: { id: { in: createdZoneIds.splice(0) } } });
  await prisma.postageRate.deleteMany({ where: { id: { in: createdRateIds.splice(0) } } });
  await prisma.packagingProfile.deleteMany({ where: { id: { in: createdProfileIds.splice(0) } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds.splice(0) } } });
});

async function runCheckoutAndGetOrder(country: string, email: string) {
  await expect(startCheckout({ status: "idle" }, checkoutFormData({ shippingCountry: country, email }))).rejects.toThrow(
    "NEXT_REDIRECT"
  );
  return prisma.order.findFirstOrThrow({ where: { email } });
}

describe("postage cost: server-side, immutable snapshot", () => {
  it("3. an admin changing a postage rate's cost later does not alter an already-placed Order's snapshot", async () => {
    const { zone, country } = await isolatedZone({ postageCost: 270, freeThreshold: null });
    const product = await disposableProduct({});
    await seedCartWithProductId(product.id, 1);
    const email = `postage-immutable-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    expect(order.estimatedPostageCost).toBe(270);

    // Admin later updates the rate.
    await prisma.postageRate.update({ where: { id: zone.postageRateId! }, data: { cost: 999 } });

    const reFetched = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(reFetched.estimatedPostageCost).toBe(270); // unchanged, still the historical value
  });
});

describe("packaging cost: snapshot and order-level (not per-item)", () => {
  it("4. packaging cost is snapshotted onto the Order from the product's assigned profile", async () => {
    const { country } = await isolatedZone({});
    const profile = await isolatedPackagingProfile(65);
    const product = await disposableProduct({ packagingProfileId: profile.id });
    await seedCartWithProductId(product.id, 1);
    const email = `packaging-snapshot-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    expect(order.packagingCost).toBe(65);
  });

  it("charges packaging once per order, not once per line item, when multiple items are ordered together", async () => {
    const { country } = await isolatedZone({});
    const profile = await isolatedPackagingProfile(65);
    const productA = await disposableProduct({ packagingProfileId: profile.id });
    const otherProfile = await isolatedPackagingProfile(999); // should NOT be summed in on top
    const productB = await disposableProduct({ packagingProfileId: otherProfile.id });

    const token = randomUUID();
    const cart = await prisma.cart.create({ data: { token } });
    await prisma.cartItem.create({ data: { cartId: cart.id, productId: productA.id, quantity: 1 } });
    await prisma.cartItem.create({ data: { cartId: cart.id, productId: productB.id, quantity: 1 } });
    cookieStore.set("hbm_cart", token);
    const email = `packaging-once-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    // Exactly one profile's cost, never 65 + 999.
    expect([65, 999]).toContain(order.packagingCost);
    expect(order.packagingCost).not.toBe(65 + 999);
  });
});

describe("customer cannot manipulate server-calculated costs", () => {
  it("5. a forged delivery/total/postage/packaging value submitted in the form is ignored — the server recalculates everything", async () => {
    const { country } = await isolatedZone({ postageCost: 270, price: 295, freeThreshold: null });
    const profile = await isolatedPackagingProfile(65);
    const product = await disposableProduct({ packagingProfileId: profile.id });
    await seedCartWithProductId(product.id, 1);
    const email = `no-manipulation-${randomUUID().slice(0, 8)}@example.com`;

    await expect(
      startCheckout(
        { status: "idle" },
        checkoutFormData({
          shippingCountry: country,
          email,
          // None of these are read by checkoutSchema — a hostile client could
          // still send them, and they must have zero effect.
          deliveryAmount: "0",
          total: "1",
          estimatedPostageCost: "0",
          packagingCost: "0",
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    const order = await prisma.order.findFirstOrThrow({ where: { email } });
    expect(order.deliveryAmount).toBe(295); // server-computed zone price, not the forged "0"
    expect(order.estimatedPostageCost).toBe(270);
    expect(order.packagingCost).toBe(65);
    expect(order.total).toBe(1000 + 295); // not the forged "1"
  });
});

describe("free delivery does not mean free fulfilment", () => {
  it("9 & 10. a free-delivery Order still records internal postage cost and packaging cost", async () => {
    const { country } = await isolatedZone({ postageCost: 270, price: 295, freeThreshold: 500 }); // low threshold, easy to exceed
    const profile = await isolatedPackagingProfile(65);
    const product = await disposableProduct({ packagingProfileId: profile.id });
    await seedCartWithProductId(product.id, 1); // £10.00, well above the £5.00 threshold
    const email = `free-delivery-fulfilment-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    expect(order.deliveryAmount).toBe(0); // free to the customer
    expect(order.estimatedPostageCost).toBe(270); // still incurred internally
    expect(order.packagingCost).toBe(65); // still incurred internally
  });
});

describe("inventory mode never affects postage/packaging", () => {
  it("13. a MADE_TO_ORDER product still gets a correct packaging and postage snapshot", async () => {
    const { country } = await isolatedZone({ postageCost: 270 });
    const profile = await isolatedPackagingProfile(65);
    const product = await disposableProduct({ madeToOrder: true, packagingProfileId: profile.id });
    await seedCartWithProductId(product.id, 1);
    const email = `mto-fulfilment-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    expect(order.estimatedPostageCost).toBe(270);
    expect(order.packagingCost).toBe(65);
  });

  it("14. a TRACK_STOCK (finite-stock) product also gets a correct packaging and postage snapshot", async () => {
    const { country } = await isolatedZone({ postageCost: 270 });
    const profile = await isolatedPackagingProfile(65);
    const product = await disposableProduct({ madeToOrder: false, packagingProfileId: profile.id });
    await seedCartWithProductId(product.id, 1);
    const email = `track-stock-fulfilment-${randomUUID().slice(0, 8)}@example.com`;

    const order = await runCheckoutAndGetOrder(country, email);
    expect(order.estimatedPostageCost).toBe(270);
    expect(order.packagingCost).toBe(65);
  });
});
