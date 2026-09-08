import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";

// Regression test for a cosmetic bug found during Stripe sandbox payment
// testing: the order-confirmation page deletes the paid customer's cart by
// token every time the page loads while the order is paid, so a refresh
// after the cart is already gone re-runs the same delete. Using
// `cart.delete()` throws (Prisma logs a "record not found" error) on that
// second and subsequent visit; `cart.deleteMany()` is a no-op instead.

const { prisma } = await import("@/lib/prisma");

describe("order-confirmation cart cleanup idempotency", () => {
  it("deleteMany on an already-deleted cart token resolves harmlessly instead of throwing", async () => {
    const token = randomUUID();
    await prisma.cart.create({ data: { token } });

    const first = await prisma.cart.deleteMany({ where: { token } });
    expect(first.count).toBe(1);

    // Simulates a second visit to the confirmation page (refresh / back-forward)
    // after the cart has already been cleaned up on the first visit.
    await expect(prisma.cart.deleteMany({ where: { token } })).resolves.toEqual({ count: 0 });
  });
});
