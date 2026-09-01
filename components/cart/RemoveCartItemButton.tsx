"use client";

import { useTransition } from "react";
import { removeCartItem } from "@/lib/actions/cart";

export default function RemoveCartItemButton({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const formData = new FormData();
        formData.set("itemId", itemId);
        startTransition(() => removeCartItem(formData));
      }}
      className="text-xs text-ink-soft underline hover:text-rose-dark"
    >
      Remove
    </button>
  );
}
