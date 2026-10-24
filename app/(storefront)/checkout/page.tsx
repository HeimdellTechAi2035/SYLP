import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartToken, getCartWithItems, cartSubtotal, priceForCartItem } from "@/lib/cart";
import { buildCheckoutQuote } from "@/lib/checkout-quote";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const cart = await getCartWithItems(await getCartToken());
  if (!cart || cart.items.length === 0) redirect("/cart");
  const pricing = await buildCheckoutQuote(cartSubtotal(cart), "");
  if (!pricing.ok) throw new Error("Unable to calculate checkout total");
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <CheckoutForm
        giftMessageEnabled={cart.items.some((item) => item.product.giftMessageEnabled)}
        initialQuote={pricing.quote}
        items={cart.items.map((item) => ({
          id: item.id, name: item.product.name, variant: item.variant?.name ?? null,
          quantity: item.quantity, lineTotal: priceForCartItem(item),
        }))}
      />
    </div>
  );
}
