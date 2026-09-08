import { describe, it, expect } from "vitest";
import { estimateOrderMargin } from "@/lib/margin";

describe("estimateOrderMargin", () => {
  it("12. calculates the estimated contribution using the documented example (revenue - product cost - postage - packaging)", () => {
    const order = { total: 2495, estimatedPostageCost: 270, packagingCost: 65 };
    const items = [{ quantity: 1, product: { costPrice: 800 } }];
    const result = estimateOrderMargin(order, items);
    expect(result.complete).toBe(true);
    expect(result.marginPence).toBe(1360); // £13.60
  });

  it("multiplies product cost by quantity across multiple line items", () => {
    const order = { total: 3000, estimatedPostageCost: 200, packagingCost: 50 };
    const items = [
      { quantity: 2, product: { costPrice: 300 } }, // 600
      { quantity: 1, product: { costPrice: 400 } }, // 400
    ];
    const result = estimateOrderMargin(order, items);
    expect(result.complete).toBe(true);
    expect(result.marginPence).toBe(3000 - 1000 - 200 - 50);
  });

  it("does not fabricate a margin when any item's product cost price is missing", () => {
    const order = { total: 2495, estimatedPostageCost: 270, packagingCost: 65 };
    const items = [{ quantity: 1, product: { costPrice: null } }];
    const result = estimateOrderMargin(order, items);
    expect(result.complete).toBe(false);
    expect(result.marginPence).toBeNull();
  });

  it("does not fabricate a margin when a line item's product was deleted (product is null)", () => {
    const order = { total: 2495, estimatedPostageCost: 270, packagingCost: 65 };
    const items = [{ quantity: 1, product: null }];
    const result = estimateOrderMargin(order, items);
    expect(result.complete).toBe(false);
  });

  it("reports incomplete for an order with no items", () => {
    const result = estimateOrderMargin({ total: 0, estimatedPostageCost: 0, packagingCost: 0 }, []);
    expect(result.complete).toBe(false);
  });
});
