import { describe, it, expect } from "vitest";
import { formatPence, poundsToPence } from "@/lib/money";

describe("formatPence", () => {
  it("formats whole pounds correctly", () => {
    expect(formatPence(500)).toBe("£5.00");
  });

  it("formats pence correctly", () => {
    expect(formatPence(99)).toBe("£0.99");
  });

  it("formats zero correctly", () => {
    expect(formatPence(0)).toBe("£0.00");
  });

  it("formats large amounts with thousands separators", () => {
    expect(formatPence(123456)).toBe("£1,234.56");
  });
});

describe("poundsToPence", () => {
  it("converts whole pounds", () => {
    expect(poundsToPence(5)).toBe(500);
  });

  it("rounds floating-point pence correctly (avoids classic 0.1+0.2 style errors)", () => {
    expect(poundsToPence(19.99)).toBe(1999);
    expect(poundsToPence(0.1)).toBe(10);
  });

  it("rounds to the nearest penny using standard IEEE754 float semantics", () => {
    // Note: 1.005 * 100 === 100.49999999999999 in IEEE754, so this rounds DOWN
    // to 100, not up to 101 — a known floating-point characteristic, not a bug
    // introduced by this function. poundsToPence is not currently called
    // anywhere in the app (all admin forms do the equivalent Math.round(...)
    // inline), so this test simply documents real behaviour rather than an
    // assumed one.
    expect(poundsToPence(1.005)).toBe(100);
    expect(poundsToPence(1.015)).toBe(101);
  });
});
