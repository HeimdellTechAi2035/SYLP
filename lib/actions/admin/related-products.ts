"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/auth";

export async function addRelatedProduct(productId: string, formData: FormData) {
  await requireOwnerSession();
  const relatedProductId = String(formData.get("relatedProductId") || "");
  const type = String(formData.get("type") || "RELATED");
  if (!relatedProductId || relatedProductId === productId) return;

  await prisma.productRelation.create({ data: { productId, relatedProductId, type } });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  revalidatePath(`/admin/products/${productId}/edit`);
  if (product) revalidatePath(`/products/${product.slug}`);
}

export async function removeRelatedProduct(formData: FormData) {
  await requireOwnerSession();
  const relationId = String(formData.get("relationId") || "");
  const productId = String(formData.get("productId") || "");
  await prisma.productRelation.delete({ where: { id: relationId } }).catch(() => {});
  revalidatePath(`/admin/products/${productId}/edit`);
}
