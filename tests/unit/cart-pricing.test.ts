import { describe, it, expect } from "vitest";
import { priceForCartItem, cartSubtotal } from "@/lib/cart";

function item(overrides: {
  quantity: number;
  price: number;
  salePrice?: number | null;
  saleActive?: boolean;
  variantPriceOverride?: number | null;
}) {
  return {
    quantity: overrides.quantity,
    product: {
      price: overrides.price,
      salePrice: overrides.salePrice ?? null,
      saleActive: overrides.saleActive ?? false,
    },
    variant: overrides.variantPriceOverride != null ? { priceOverride: overrides.variantPriceOverride } : null,
  };
}

describe("priceForCartItem", () => {
  it("uses base product price when there is no sale or variant", () => {
    expect(priceForCartItem(item({ quantity: 1, price: 500 }))).toBe(500);
  });

  it("multiplies by quantity", () => {
    expect(priceForCartItem(item({ quantity: 3, price: 500 }))).toBe(1500);
  });

  it("uses sale price when saleActive is true and a sale price is set", () => {
    expect(priceForCartItem(item({ quantity: 1, price: 1000, salePrice: 700, saleActive: true }))).toBe(700);
  });

  it("ignores sale price when saleActive is false, even if a sale price is set", () => {
    expect(priceForCartItem(item({ quantity: 1, price: 1000, salePrice: 700, saleActive: false }))).toBe(1000);
  });

  it("a variant price override takes priority over both base price and sale price", () => {
    expect(
      priceForCartItem(
        item({ quantity: 1, price: 1000, salePrice: 700, saleActive: true, variantPriceOverride: 1800 })
      )
    ).toBe(1800);
  });

  it("combines variant override correctly with quantity", () => {
    expect(priceForCartItem(item({ quantity: 4, price: 1000, variantPriceOverride: 1800 }))).toBe(7200);
  });
});

describe("cartSubtotal", () => {
  function cartWithItems(items: ReturnType<typeof item>[]) {
    return { items } as Parameters<typeof cartSubtotal>[0];
  }

  it("sums a single item", () => {
    expect(cartSubtotal(cartWithItems([item({ quantity: 2, price: 500 })]))).toBe(1000);
  });

  it("sums multiple different products at different prices", () => {
    expect(
      cartSubtotal(
        cartWithItems([
          item({ quantity: 2, price: 500 }), // 1000
          item({ quantity: 1, price: 1500 }), // 1500
          item({ quantity: 3, price: 700, salePrice: 500, saleActive: true }), // 1500
        ])
      )
    ).toBe(4000);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartSubtotal(cartWithItems([]))).toBe(0);
  });
});
