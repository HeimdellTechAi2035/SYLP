import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCartToken, getCartWithItems, cartSubtotal, priceForCartItem } from "@/lib/cart";
import { getSiteSettings } from "@/lib/settings";
import { formatPence } from "@/lib/money";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import CartQuantityControl from "@/components/cart/CartQuantityControl";
import RemoveCartItemButton from "@/components/cart/RemoveCartItemButton";

export const metadata: Metadata = { title: "Your Basket" };

export default async function CartPage() {
  const [token, settings] = await Promise.all([getCartToken(), getSiteSettings()]);
  const cart = await getCartWithItems(token);
  const items = cart?.items ?? [];
  const subtotal = cart ? cartSubtotal(cart) : 0;

  const threshold = settings.freeDeliveryThreshold;
  const remainingForFreeDelivery = threshold ? Math.max(0, threshold - subtotal) : 0;

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Your basket is empty</h1>
        <p className="text-ink-soft mb-6">Find your new favourite piece.</p>
        <Link href="/shop" className="inline-block px-6 py-3 rounded-full bg-rose text-ink font-semibold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl mb-6">Your Basket</h1>

      {threshold != null && (
        <div className="mb-8 bg-blush rounded-xl p-4 text-sm">
          {remainingForFreeDelivery > 0 ? (
            <p>You&apos;re <strong>{formatPence(remainingForFreeDelivery)}</strong> away from free UK delivery.</p>
          ) : (
            <p className="text-sage font-medium">You&apos;ve unlocked free UK delivery!</p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <ul className="divide-y divide-ink/10">
          {items.map((item) => (
            <li key={item.id} className="py-5 flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-blush shrink-0">
                {item.product.mainImage ? (
                  <Image src={item.product.mainImage} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-rose-dark">
                  {item.product.name}
                </Link>
                {item.variant && <p className="text-sm text-ink-soft">{item.variant.name}</p>}
                {item.giftMessage && <p className="text-xs text-ink-soft italic mt-1">Gift message: {item.giftMessage}</p>}
                <div className="flex items-center gap-4 mt-2">
                  <CartQuantityControl itemId={item.id} quantity={item.quantity} />
                  <RemoveCartItemButton itemId={item.id} />
                </div>
              </div>
              <div className="font-semibold shrink-0">{formatPence(priceForCartItem(item))}</div>
            </li>
          ))}
        </ul>

        <div className="bg-blush/70 rounded-2xl p-6 h-fit">
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPence(subtotal)}</span>
          </div>
          <p className="text-xs text-ink-soft mb-4">Delivery and any discounts are calculated at checkout.</p>
          <Link
            href="/checkout"
            className="block text-center w-full py-3 rounded-full bg-rose text-ink font-semibold hover:bg-rose-dark transition-colors"
          >
            Checkout
          </Link>
          <Link href="/shop" className="block text-center text-sm text-ink-soft mt-3 hover:text-ink">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
