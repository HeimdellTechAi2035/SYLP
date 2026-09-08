import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

// Extends the Stage 4 admin-authorisation audit to the three new
// Stripe-catalogue-sync actions added in this stage — none of them existed
// when that audit ran, so they need their own proof.

const cookieStore = createMockCookieStore();

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    products: { create: vi.fn(), update: vi.fn() },
    prices: { create: vi.fn(), update: vi.fn() },
  },
  stripeConfigured: vi.fn(() => true),
}));

const { stripe } = await import("@/lib/stripe");
const { prisma } = await import("@/lib/prisma");
const { createCustomerSession } = await import("@/lib/customer-auth");
const { retryStripeSync } = await import("@/lib/actions/admin/products");
const { bulkSyncCatalogueToStripe, getStripeCatalogueSummary } = await import(
  "@/lib/actions/admin/stripe-catalogue-sync"
);

async function activeProduct() {
  const id = randomUUID().slice(0, 8);
  return prisma.product.create({
    data: { slug: `authz-sync-${id}`, sku: `AUTHZ-${id}`, name: "Authz Sync Product", price: 500, status: "ACTIVE" },
  });
}

describe("13 & 14. Stripe sync actions require admin authorisation", () => {
  it("retryStripeSync: unauthenticated caller is rejected, no Stripe call made", async () => {
    cookieStore._map.clear();
    const product = await activeProduct();

    await expect(retryStripeSync(product.id)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(stripe.products.create).not.toHaveBeenCalled();
    const unchanged = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(unchanged.stripeProductId).toBeNull();
  });

  it("retryStripeSync: a logged-in CUSTOMER (not admin) is rejected, no Stripe call made", async () => {
    cookieStore._map.clear();
    const customer = await prisma.customer.upsert({
      where: { email: "authz-sync-customer@example.com" },
      update: {},
      create: { email: "authz-sync-customer@example.com", firstName: "Authz", lastName: "Customer" },
    });
    await createCustomerSession({ sub: customer.id, email: customer.email });
    const product = await activeProduct();

    await expect(retryStripeSync(product.id)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(stripe.products.create).not.toHaveBeenCalled();
  });

  it("bulkSyncCatalogueToStripe: unauthenticated caller is rejected, nothing synced", async () => {
    cookieStore._map.clear();
    await expect(bulkSyncCatalogueToStripe()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(stripe.products.create).not.toHaveBeenCalled();
  });

  it("getStripeCatalogueSummary: unauthenticated caller cannot even read the sync summary", async () => {
    cookieStore._map.clear();
    await expect(getStripeCatalogueSummary()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });
});
