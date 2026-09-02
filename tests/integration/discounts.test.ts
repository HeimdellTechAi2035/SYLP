import { describe, it, expect } from "vitest";
import { validateDiscountCode } from "@/lib/discounts";

// Fixtures (prisma/seed-test.ts) — see that file for the exact rows.

describe("validateDiscountCode", () => {
  it("accepts a valid percentage discount and calculates the correct amount", async () => {
    const result = await validateDiscountCode("TESTSAVE10", 10000, "shopper@example.com");
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.amount).toBe(1000); // 10% of £100.00
  });

  it("accepts a valid fixed discount and calculates the correct amount", async () => {
    const result = await validateDiscountCode("TESTFIXED5", 10000, "shopper@example.com");
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.amount).toBe(500); // £5.00 off
  });

  it("caps a fixed discount at the subtotal — never produces a negative order total", async () => {
    const result = await validateDiscountCode("TESTFIXED5", 200, "shopper@example.com");
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.amount).toBe(200); // capped, not 500
  });

  it("is case-insensitive on the code", async () => {
    const result = await validateDiscountCode("testsave10", 10000, "shopper@example.com");
    expect(result.valid).toBe(true);
  });

  it("enforces the minimum-spend rule", async () => {
    const below = await validateDiscountCode("TESTMINSPEND", 4999, "shopper@example.com");
    expect(below.valid).toBe(false);

    const atThreshold = await validateDiscountCode("TESTMINSPEND", 5000, "shopper@example.com");
    expect(atThreshold.valid).toBe(true);
  });

  it("rejects an inactive discount", async () => {
    const result = await validateDiscountCode("TESTINACTIVE", 10000, "shopper@example.com");
    expect(result.valid).toBe(false);
  });

  it("rejects an expired discount", async () => {
    const result = await validateDiscountCode("TESTEXPIRED", 10000, "shopper@example.com");
    expect(result.valid).toBe(false);
  });

  it("rejects a discount that hasn't started yet", async () => {
    const result = await validateDiscountCode("TESTFUTURE", 10000, "shopper@example.com");
    expect(result.valid).toBe(false);
  });

  it("rejects a discount that has reached its total usage limit", async () => {
    const result = await validateDiscountCode("TESTMAXUSES", 10000, "shopper@example.com");
    expect(result.valid).toBe(false);
  });

  it("enforces the per-customer usage limit against a customer who has already used it on a paid order", async () => {
    const result = await validateDiscountCode("TESTPERCUSTOMER", 10000, "used-discount@example.com");
    expect(result.valid).toBe(false);
  });

  it("still allows a per-customer-limited discount for a customer who hasn't used it before", async () => {
    const result = await validateDiscountCode("TESTPERCUSTOMER", 10000, "brand-new-shopper@example.com");
    expect(result.valid).toBe(true);
  });

  it("rejects a code that doesn't exist", async () => {
    const result = await validateDiscountCode("DOES-NOT-EXIST", 10000, "shopper@example.com");
    expect(result.valid).toBe(false);
  });
});
