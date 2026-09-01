"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function addGiftSetItem(giftSetId: string, formData: FormData) {
  await requireAdminSession();
  const componentId = String(formData.get("componentId") || "");
  const quantity = Number(formData.get("quantity") || 1);
  if (!componentId) return;

  await prisma.giftSetItem.create({ data: { giftSetId, componentId, quantity } });
  revalidatePath(`/admin/products/${giftSetId}/edit`);
  revalidatePath("/", "layout");
}

export async function removeGiftSetItem(formData: FormData) {
  await requireAdminSession();
  const itemId = String(formData.get("itemId") || "");
  const giftSetId = String(formData.get("giftSetId") || "");
  await prisma.giftSetItem.delete({ where: { id: itemId } }).catch(() => {});
  revalidatePath(`/admin/products/${giftSetId}/edit`);
  revalidatePath("/", "layout");
}
