import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ discount: vi.fn() }));
vi.mock("@/lib/discounts", () => ({ validateDiscountCode: mocks.discount }));
vi.mock("@/lib/settings", () => ({
  getActiveDeliveryZones: async () => [{ countries: "United Kingdom", name: "UK Standard", price: 295, freeThreshold: 5001, postageRateId: null }],
  getSiteSettings: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { postageRate: { findUnique: vi.fn() } } }));
import { buildCheckoutQuote } from "@/lib/checkout-quote";

beforeEach(() => mocks.discount.mockReset());
describe("the checkout quote used for the visible total and payment", () => {
  it("includes standard postage on a single hoodie", async () => {
    const result = await buildCheckoutQuote(3799, "");
    expect(result).toMatchObject({ ok: true, quote: { subtotal: 3799, deliveryAmount: 295, total: 4094, discountCode: null } });
  });
  it("includes standard postage on a single t-shirt", async () => {
    expect(await buildCheckoutQuote(2699, "")).toMatchObject({ ok: true, quote: { deliveryAmount: 295, total: 2994 } });
  });
  it("keeps postage at exactly £50 and removes it at £50.01", async () => {
    expect(await buildCheckoutQuote(5000, "")).toMatchObject({ ok: true, quote: { deliveryAmount: 295, total: 5295 } });
    expect(await buildCheckoutQuote(5001, "")).toMatchObject({ ok: true, quote: { deliveryAmount: 0, total: 5001 } });
  });
  it("makes postage free for a hoodie and t-shirt together", async () => {
    expect(await buildCheckoutQuote(6498, "")).toMatchObject({ ok: true, quote: { deliveryAmount: 0, total: 6498 } });
  });
  it("reapplies postage when a discount reduces goods to exactly £50", async () => {
    mocks.discount.mockResolvedValue({ valid: true, amount: 1498, code: "SAVE", discountId: "test" });
    expect(await buildCheckoutQuote(6498, "buyer@example.com", "SAVE")).toMatchObject({ ok: true, quote: { discountAmount: 1498, deliveryAmount: 295, total: 5295 } });
    expect(mocks.discount).toHaveBeenCalledWith("SAVE", 6498, "buyer@example.com");
  });
  it("rejects an invalid code rather than quoting a misleading discount", async () => {
    mocks.discount.mockResolvedValue({ valid: false, message: "This discount code is not valid." });
    expect(await buildCheckoutQuote(3799, "buyer@example.com", "BAD")).toEqual({ ok: false, message: "This discount code is not valid." });
  });
});
