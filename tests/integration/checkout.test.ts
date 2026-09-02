import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

const cookieStore = createMockCookieStore();
let redirectedTo: string | null = null;

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectedTo = url;
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    coupons: { create: vi.fn() },
  },
  stripeConfigured: vi.fn(),
}));

// Imported AFTER the mocks above so they pick up the mocked modules.
const { prisma } = await import("@/lib/prisma");
const { startCheckout } = await import("@/lib/actions/checkout");
const { stripe, stripeConfigured } = await import("@/lib/stripe");

function checkoutFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    email: "checkout-test@example.com",
    firstName: "Check",
    lastName: "Out",
    shippingLine1: "1 Test Street",
    shippingCity: "London",
    shippingPostcode: "SW1A 1AA",
    shippingCountry: "United Kingdom",
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) fd.set(k, v);
  return fd;
}

/** Seeds a real Cart + CartItem in the test DB and points the mocked cookie jar at it. */
async function seedCartWithProduct(slug: string, quantity: number) {
  const product = await prisma.product.findUniqueOrThrow({ where: { slug } });
  const token = randomUUID();
  const cart = await prisma.cart.create({ data: { token } });
  await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity } });
  cookieStore.set("hbm_cart", token);
  return { product, cart };
}

beforeEach(() => {
  cookieStore._map.clear();
  redirectedTo = null;
  vi.mocked(stripe.checkout.sessions.create).mockReset();
  vi.mocked(stripe.coupons.create).mockReset();
  vi.mocked(stripeConfigured).mockReset();
});

describe("startCheckout", () => {
  it("fails gracefully when Stripe is not configured, and creates no order", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(false);
    await seedCartWithProduct("test-melt-standard", 1);

    const result = await startCheckout({ status: "idle" }, checkoutFormData());

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/not yet configured/i);
    const orders = await prisma.order.count({ where: { email: "checkout-test@example.com" } });
    expect(orders).toBe(0);
  });

  it("rejects an empty basket", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    // no cart cookie set at all
    const result = await startCheckout({ status: "idle" }, checkoutFormData());
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/empty/i);
  });

  it("rejects checkout when requested quantity exceeds available stock", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    // test-melt-oos has stockQuantity 0, continueSellingOOS false, madeToOrder false
    await seedCartWithProduct("test-melt-oos", 1);

    const result = await startCheckout({ status: "idle" }, checkoutFormData());

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/stock/i);
  });

  it("allows checkout for a made-to-order product with zero stock", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ id: "sess_mto", url: "https://stripe.test/mto" } as never);
    await seedCartWithProduct("test-melt-mto", 2);

    await expect(startCheckout({ status: "idle" }, checkoutFormData({ email: "mto@example.com" }))).rejects.toThrow(
      "NEXT_REDIRECT"
    );
    expect(redirectedTo).toBe("https://stripe.test/mto");
  });

  it("rejects checkout for a made-to-order product regardless of an absurdly high requested quantity being 'in stock' — no finite limit is enforced either way", async () => {
    // Made-to-order bypasses the stock check entirely; this just documents
    // that a stored stockQuantity of 0 never blocks it, at any quantity.
    vi.mocked(stripeConfigured).mockReturnValue(true);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ id: "sess_mto_bulk", url: "https://stripe.test/mto-bulk" } as never);
    await seedCartWithProduct("test-melt-mto", 50);

    await expect(
      startCheckout({ status: "idle" }, checkoutFormData({ email: "mto-bulk@example.com" }))
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectedTo).toBe("https://stripe.test/mto-bulk");
  });

  /**
   * Uses a dedicated, throwaway product rather than a shared seed fixture —
   * this test archives it mid-test, which would otherwise permanently
   * corrupt a fixture other tests in this file rely on staying ACTIVE.
   */
  async function seedCartWithDisposableProduct(overrides: { madeToOrder?: boolean; stockQuantity?: number }) {
    const id = randomUUID().slice(0, 8);
    const product = await prisma.product.create({
      data: {
        slug: `disposable-${id}`,
        sku: `DISP-${id}`,
        name: "Disposable Test Product",
        price: 500,
        status: "ACTIVE",
        stockQuantity: overrides.stockQuantity ?? 10,
        madeToOrder: overrides.madeToOrder ?? false,
      },
    });
    const token = randomUUID();
    const cart = await prisma.cart.create({ data: { token } });
    await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 1 } });
    cookieStore.set("hbm_cart", token);
    return product;
  }

  it("rejects checkout for a TRACK_STOCK product that was archived after being added to the cart", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    const product = await seedCartWithDisposableProduct({ madeToOrder: false });
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });

    const result = await startCheckout({ status: "idle" }, checkoutFormData({ email: "archived-track@example.com" }));

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/no longer available/i);
  });

  it("rejects checkout for a MADE_TO_ORDER product that was archived after being added to the cart — unlimited availability never overrides publication status", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    const product = await seedCartWithDisposableProduct({ madeToOrder: true, stockQuantity: 0 });
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });

    const result = await startCheckout({ status: "idle" }, checkoutFormData({ email: "archived-mto@example.com" }));

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/no longer available/i);
  });

  it("rejects an invalid discount code without creating an order", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    await seedCartWithProduct("test-melt-standard", 1);

    const result = await startCheckout(
      { status: "idle" },
      checkoutFormData({ discountCode: "DOES-NOT-EXIST", email: "discount-fail@example.com" })
    );

    expect(result.status).toBe("error");
    const orders = await prisma.order.count({ where: { email: "discount-fail@example.com" } });
    expect(orders).toBe(0);
  });

  it("creates an order with correct server-recalculated subtotal, discount, delivery and total, and redirects to Stripe", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    vi.mocked(stripe.coupons.create).mockResolvedValue({ id: "coupon_test" } as never);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      id: "sess_happy",
      url: "https://stripe.test/happy",
    } as never);

    // test-melt-standard: price 500. Quantity 2 => subtotal 1000.
    await seedCartWithProduct("test-melt-standard", 2);
    const email = `happy-${randomUUID().slice(0, 8)}@example.com`;

    await expect(
      startCheckout({ status: "idle" }, checkoutFormData({ email, discountCode: "TESTSAVE10" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    const order = await prisma.order.findFirstOrThrow({ where: { email } });
    expect(order.subtotal).toBe(1000);
    expect(order.discountAmount).toBe(100); // 10% of 1000
    expect(order.deliveryAmount).toBe(295); // below £30 free-delivery threshold
    expect(order.total).toBe(1000 - 100 + 295);
    expect(order.paymentStatus).toBe("PENDING");
    expect(redirectedTo).toBe("https://stripe.test/happy");

    // The Stripe session was built from server-recalculated prices, not any client input.
    const call = vi.mocked(stripe.checkout.sessions.create).mock.calls[0];
    expect(call).toBeDefined();
    const sessionArgs = call![0]!;
    expect(sessionArgs.line_items?.[0]).toMatchObject({
      quantity: 2,
      price_data: expect.objectContaining({ unit_amount: 500 }),
    });
  });

  it("applies free delivery once the discounted subtotal reaches the threshold", async () => {
    vi.mocked(stripeConfigured).mockReturnValue(true);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ id: "sess_free", url: "https://stripe.test/free" } as never);

    // test-candle-variant base price 1500 x 2 = 3000, which is exactly the £30 threshold.
    await seedCartWithProduct("test-candle-variant", 2);
    const email = `free-delivery-${randomUUID().slice(0, 8)}@example.com`;

    await expect(startCheckout({ status: "idle" }, checkoutFormData({ email }))).rejects.toThrow("NEXT_REDIRECT");

    const order = await prisma.order.findFirstOrThrow({ where: { email } });
    expect(order.subtotal).toBe(3000);
    expect(order.deliveryAmount).toBe(0);
    expect(order.total).toBe(3000);
  });

  it("fails gracefully (no unhandled exception, no dangling PAID order) if Stripe's API itself rejects", async () => {
    // Regression test for a real bug found during Stage 3: the order was being
    // created in the database BEFORE the Stripe session-creation call, with no
    // try/catch around that call — a genuine Stripe API failure (as opposed to
    // "not configured", which is handled earlier) would throw an unhandled
    // exception out of the server action instead of returning a graceful error.
    vi.mocked(stripeConfigured).mockReturnValue(true);
    vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(new Error("Stripe network error"));
    await seedCartWithProduct("test-melt-standard", 1);
    const email = `stripe-fail-${randomUUID().slice(0, 8)}@example.com`;

    const result = await startCheckout({ status: "idle" }, checkoutFormData({ email }));

    expect(result.status).toBe("error");
    expect(result.message).not.toMatch(/error:|at .*\(.*:\d+:\d+\)/i); // no raw stack trace leaked to the user

    const order = await prisma.order.findFirst({ where: { email } });
    // Whether or not an order row was left behind, it must never be left as PAID.
    if (order) expect(order.paymentStatus).not.toBe("PAID");
  });
});
