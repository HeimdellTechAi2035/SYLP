import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { unitPriceFor } from "@/lib/pricing";

export const CART_COOKIE = "hbm_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/** Reads the cart token cookie without creating anything — safe for read-only rendering paths. */
export async function getCartToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

/** Gets (or lazily creates) the current visitor's cart. Only call from a Server Action or Route Handler. */
export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;

  if (token) {
    const existing = await prisma.cart.findUnique({ where: { token } });
    if (existing) return existing;
  }

  token = randomUUID();
  const cart = await prisma.cart.create({ data: { token } });
  cookieStore.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return cart;
}

export async function getCartWithItems(token: string | null) {
  if (!token) return null;
  return prisma.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          product: { include: { images: true, packagingProfile: true } },
          variant: { include: { packagingProfile: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/** Recomputes line prices server-side from the database — never trust a client-submitted total. */
export function priceForCartItem(item: {
  quantity: number;
  product: { price: number; salePrice: number | null; saleActive: boolean };
  variant: { priceOverride: number | null } | null;
}) {
  return unitPriceFor(item.product, item.variant) * item.quantity;
}

export function cartSubtotal(
  cart: NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>
) {
  return cart.items.reduce((sum, item) => sum + priceForCartItem(item), 0);
}
