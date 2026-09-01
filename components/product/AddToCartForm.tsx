"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import Price from "@/components/ui/Price";

type Variant = {
  id: string;
  name: string;
  stockQuantity: number;
  priceOverride: number | null;
};

export default function AddToCartForm({
  productId,
  price,
  salePrice,
  saleActive,
  variants,
  stockQuantity,
  continueSellingOOS,
  madeToOrder,
  giftMessageEnabled,
}: {
  productId: string;
  price: number;
  salePrice: number | null;
  saleActive: boolean;
  variants: Variant[];
  stockQuantity: number;
  continueSellingOOS: boolean;
  madeToOrder: boolean;
  giftMessageEnabled?: boolean;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const effectiveStock = selectedVariant ? selectedVariant.stockQuantity : stockQuantity;
  const outOfStock = effectiveStock <= 0 && !continueSellingOOS && !madeToOrder;
  const displayPrice = selectedVariant?.priceOverride ?? price;

  function handleSubmit(formData: FormData) {
    setAdded(false);
    startTransition(async () => {
      await addToCart(formData);
      setAdded(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />

      <div>
        <Price price={displayPrice} salePrice={salePrice} saleActive={saleActive} size="lg" />
      </div>

      {variants.length > 0 && (
        <div>
          <label htmlFor="variant" className="block text-sm font-medium mb-1">
            Fragrance / Option
          </label>
          <select
            id="variant"
            name="variantId"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stockQuantity <= 0 && !continueSellingOOS && !madeToOrder}>
                {v.name}
                {v.stockQuantity <= 0 && !continueSellingOOS && !madeToOrder ? " (Out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {giftMessageEnabled && (
        <div>
          <label htmlFor="giftMessage" className="block text-sm font-medium mb-1">
            Gift message (optional)
          </label>
          <textarea
            id="giftMessage"
            name="giftMessage"
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            placeholder="Add a short message to include with this gift"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium">Qty</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-20 rounded-lg border border-ink/15 px-3 py-2"
        />
      </div>

      {outOfStock ? (
        <button type="button" disabled className="w-full py-3 rounded-full bg-ink/20 text-ink-soft font-semibold cursor-not-allowed">
          Out of Stock
        </button>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-full bg-rose-dark text-cream font-semibold hover:bg-ink transition-colors disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add to Basket"}
        </button>
      )}

      {added && (
        <p role="status" className="text-sm text-sage font-medium">
          Added to your basket.
        </p>
      )}

      {madeToOrder && (
        <p className="text-xs text-ink-soft">This item is made to order.</p>
      )}
    </form>
  );
}
