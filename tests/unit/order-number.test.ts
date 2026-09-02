import { describe, it, expect } from "vitest";
import { generateOrderNumber } from "@/lib/order-number";

describe("generateOrderNumber", () => {
  it("starts at HM-1000 for the first order", () => {
    expect(generateOrderNumber(0)).toBe("HM-1000");
  });

  it("increments with the sequence", () => {
    expect(generateOrderNumber(1)).toBe("HM-1001");
    expect(generateOrderNumber(42)).toBe("HM-1042");
  });

  it("produces distinct numbers for distinct sequences", () => {
    const a = generateOrderNumber(5);
    const b = generateOrderNumber(6);
    expect(a).not.toBe(b);
  });
});
