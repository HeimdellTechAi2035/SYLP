"use client";

import { useTransition } from "react";
import { updateCartItemQuantity } from "@/lib/actions/cart";

export default function CartQuantityControl({ itemId, quantity }: { itemId: string; quantity: number }) {
  const [pending, startTransition] = useTransition();

  function change(delta: number) {
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("quantity", String(Math.max(0, quantity + delta)));
    startTransition(() => updateCartItemQuantity(formData));
  }

  return (
    <div className="flex items-center border border-ink/15 rounded-full" aria-label="Quantity">
      <button type="button" onClick={() => change(-1)} disabled={pending} className="px-3 py-1 text-lg" aria-label="Decrease quantity">
        −
      </button>
      <span className="px-2 text-sm min-w-6 text-center">{quantity}</span>
      <button type="button" onClick={() => change(1)} disabled={pending} className="px-3 py-1 text-lg" aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
