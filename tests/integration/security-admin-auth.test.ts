import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { createMockCookieStore } from "./helpers/mockCookies";

// Proves the core claim of the security audit: every admin server action is
// individually gated by requireAdminSession(), independent of any UI hiding —
// an unauthenticated caller, and separately a caller who only holds a valid
// CUSTOMER session (not an admin one), cannot invoke it or mutate data.

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

const { prisma } = await import("@/lib/prisma");
const { requireAdminSession } = await import("@/lib/auth");
const { createCustomerSession } = await import("@/lib/customer-auth");
const { createCategory, deleteCategory } = await import("@/lib/actions/admin/categories");
const { createDiscount, deleteDiscount } = await import("@/lib/actions/admin/discounts");
const { updateSiteSettings } = await import("@/lib/actions/admin/settings");

describe("requireAdminSession (the shared guard)", () => {
  it("redirects to /admin/login when there is no session at all", async () => {
    cookieStore._map.clear();
    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("redirects to /admin/login even when a valid CUSTOMER session cookie is present", async () => {
    cookieStore._map.clear();
    const customer = await prisma.customer.upsert({
      where: { email: "security-audit-customer@example.com" },
      update: {},
      create: { email: "security-audit-customer@example.com", firstName: "Sec", lastName: "Audit" },
    });
    await createCustomerSession({ sub: customer.id, email: customer.email });

    // A customer session lives under a completely different cookie name/JWT
    // payload shape — requireAdminSession must not be fooled by its presence.
    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });
});

describe("admin server actions reject non-admin callers before touching the database", () => {
  it("createCategory: unauthenticated caller cannot create a category", async () => {
    cookieStore._map.clear();
    const slug = `security-test-${randomUUID().slice(0, 8)}`;
    const fd = new FormData();
    fd.set("name", "Security Test Category");
    fd.set("slug", slug);

    await expect(createCategory(fd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    const created = await prisma.category.findUnique({ where: { slug } });
    expect(created).toBeNull();
  });

  it("createCategory: a logged-in CUSTOMER (not admin) cannot create a category", async () => {
    cookieStore._map.clear();
    const customer = await prisma.customer.upsert({
      where: { email: "security-audit-customer-2@example.com" },
      update: {},
      create: { email: "security-audit-customer-2@example.com", firstName: "Sec", lastName: "Audit2" },
    });
    await createCustomerSession({ sub: customer.id, email: customer.email });

    const slug = `security-test-${randomUUID().slice(0, 8)}`;
    const fd = new FormData();
    fd.set("name", "Security Test Category 2");
    fd.set("slug", slug);

    await expect(createCategory(fd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    const created = await prisma.category.findUnique({ where: { slug } });
    expect(created).toBeNull();
  });

  it("deleteCategory: unauthenticated caller cannot delete an existing category", async () => {
    cookieStore._map.clear();
    const category = await prisma.category.create({
      data: { slug: `security-delete-${randomUUID().slice(0, 8)}`, name: "Do Not Delete Me" },
    });

    const fd = new FormData();
    fd.set("categoryId", category.id);
    await expect(deleteCategory(fd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    const stillExists = await prisma.category.findUnique({ where: { id: category.id } });
    expect(stillExists).not.toBeNull();
  });

  it("createDiscount / deleteDiscount: unauthenticated caller cannot create or delete discount codes", async () => {
    cookieStore._map.clear();
    const code = `SECTEST${randomUUID().slice(0, 6).toUpperCase()}`;
    const fd = new FormData();
    fd.set("code", code);
    fd.set("type", "PERCENTAGE");
    fd.set("value", "50");

    await expect(createDiscount(fd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(await prisma.discount.findUnique({ where: { code } })).toBeNull();

    // Also confirm an existing discount can't be deleted by an unauthenticated caller.
    const existing = await prisma.discount.create({ data: { code: `${code}B`, type: "FIXED", value: 100 } });
    const deleteFd = new FormData();
    deleteFd.set("discountId", existing.id);
    await expect(deleteDiscount(deleteFd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(await prisma.discount.findUnique({ where: { id: existing.id } })).not.toBeNull();
  });

  it("updateSiteSettings: unauthenticated caller cannot change site-wide settings", async () => {
    cookieStore._map.clear();
    const before = await prisma.siteSettings.findUnique({ where: { id: 1 } });

    const fd = new FormData();
    fd.set("businessName", "HACKED BUSINESS NAME");
    fd.set("standardDeliveryPrice", "0");
    await expect(updateSiteSettings(fd)).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    const after = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    expect(after?.businessName).not.toBe("HACKED BUSINESS NAME");
    expect(after?.businessName).toBe(before?.businessName);
  });
});
