import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

// Vitest in this project deliberately never renders React (see TESTING.md) —
// so "the customer never sees field X" is proven here the same way the rest
// of the customer-facing surface already relies on: the template that would
// display it simply never references the field at all. This scans the real
// files that ship to production, not a copy.

const CUSTOMER_FACING_FILES = [
  "app/(storefront)/order-confirmation/page.tsx",
  "app/(storefront)/checkout/page.tsx",
  "app/(storefront)/cart/page.tsx",
  "components/checkout/CheckoutForm.tsx",
];

const INTERNAL_ONLY_FIELDS = ["packagingCost", "estimatedPostageCost"];

describe("6 & 7. internal packaging/postage costs are never rendered to customers", () => {
  for (const file of CUSTOMER_FACING_FILES) {
    it(`${file} never references packagingCost or estimatedPostageCost`, () => {
      const source = readFileSync(path.join(process.cwd(), file), "utf8");
      for (const field of INTERNAL_ONLY_FIELDS) {
        expect(source).not.toContain(field);
      }
    });
  }
});

describe("8. the admin order page does surface both internal costs", () => {
  it("app/admin/(protected)/orders/[id]/page.tsx references both estimatedPostageCost and packagingCost", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/admin/(protected)/orders/[id]/page.tsx"),
      "utf8"
    );
    expect(source).toContain("estimatedPostageCost");
    expect(source).toContain("packagingCost");
  });
});
