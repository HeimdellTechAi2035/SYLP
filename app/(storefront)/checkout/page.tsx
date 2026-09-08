import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartToken, getCartWithItems, cartSubtotal, priceForCartItem } from "@/lib/cart";
import { formatPence } from "@/lib/money";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const token = await getCartToken();
  const cart = await getCartWithItems(token);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = cartSubtotal(cart);
  const giftMessageEnabled = cart.items.some((item) => item.product.giftMessageEnabled);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <CheckoutForm giftMessageEnabled={giftMessageEnabled} />

        <div className="bg-blush/70 rounded-2xl p-6 h-fit order-first lg:order-last">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <ul className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm gap-2">
                <span className="text-ink-soft">
                  {item.quantity} x {item.product.name}
                  {item.variant && ` (${item.variant.name})`}
                </span>
                <span className="font-medium shrink-0">{formatPence(priceForCartItem(item))}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-ink/10 pt-3 flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatPence(subtotal)}</span>
          </div>
          <p className="text-xs text-ink-soft mt-2">Delivery and any discount are applied on the next step.</p>
        </div>
      </div>
    </div>
  );
}
