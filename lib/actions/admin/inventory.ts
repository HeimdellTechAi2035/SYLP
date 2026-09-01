"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function updateProductStock(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") || "");
  const stockQuantity = Number(formData.get("stockQuantity") || 0);
  await prisma.product.update({ where: { id: productId }, data: { stockQuantity } });
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}

export async function updateVariantStock(formData: FormData) {
  await requireAdminSession();
  const variantId = String(formData.get("variantId") || "");
  const stockQuantity = Number(formData.get("stockQuantity") || 0);
  await prisma.productVariant.update({ where: { id: variantId }, data: { stockQuantity } });
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}
