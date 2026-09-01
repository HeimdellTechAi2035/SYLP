"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const variantId = formData.get("variantId") ? String(formData.get("variantId")) : null;
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  const giftMessage = formData.get("giftMessage") ? String(formData.get("giftMessage")) : null;
  const redirectTo = formData.get("redirectTo") ? String(formData.get("redirectTo")) : null;

  if (!productId) throw new Error("Missing product");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") throw new Error("Product not available");

  const cart = await getOrCreateCart();

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity, giftMessage },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");

  if (redirectTo) redirect(redirectTo);
}

export async function updateCartItemQuantity(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const quantity = Math.max(0, Number(formData.get("quantity")) || 0);

  if (!itemId) return;

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } }).catch(() => {});
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  if (!itemId) return;
  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
