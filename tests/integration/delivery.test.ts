import { describe, it, expect } from "vitest";
import { calculateDeliveryAmount } from "@/lib/delivery";

// Fixtures (prisma/seed-test.ts): one active "Test UK Zone" for "United Kingdom",
// price 295 (£2.95), freeThreshold 3000 (£30.00).

describe("calculateDeliveryAmount", () => {
  it("charges the zone price when below the free-delivery threshold", () => {
    return calculateDeliveryAmount(2999, "United Kingdom").then((fee) => {
      expect(fee).toBe(295);
    });
  });

  it("is free exactly AT the threshold (boundary is inclusive)", async () => {
    const fee = await calculateDeliveryAmount(3000, "United Kingdom");
    expect(fee).toBe(0);
  });

  it("is free above the threshold", async () => {
    const fee = await calculateDeliveryAmount(5000, "United Kingdom");
    expect(fee).toBe(0);
  });

  it("matches the zone by country case-insensitively", async () => {
    const fee = await calculateDeliveryAmount(1000, "united kingdom");
    expect(fee).toBe(295);
  });

  it("falls back to the only active zone when the country doesn't match any zone", async () => {
    // Documents existing single-zone-fallback behaviour — not a bug, just how
    // calculateDeliveryAmount behaves with only one configured zone.
    const fee = await calculateDeliveryAmount(1000, "Nowhereland");
    expect(fee).toBe(295);
  });
});
