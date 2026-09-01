"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function createDeliveryZone(formData: FormData) {
  await requireAdminSession();
  await prisma.deliveryZone.create({
    data: {
      name: String(formData.get("name") || ""),
      countries: String(formData.get("countries") || ""),
      price: Math.round(Number(formData.get("price") || 0) * 100),
      freeThreshold: formData.get("freeThreshold") ? Math.round(Number(formData.get("freeThreshold")) * 100) : null,
      estimatedDays: String(formData.get("estimatedDays") || "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/delivery");
}

export async function updateDeliveryZone(zoneId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.deliveryZone.update({
    where: { id: zoneId },
    data: {
      name: String(formData.get("name") || ""),
      countries: String(formData.get("countries") || ""),
      price: Math.round(Number(formData.get("price") || 0) * 100),
      freeThreshold: formData.get("freeThreshold") ? Math.round(Number(formData.get("freeThreshold")) * 100) : null,
      estimatedDays: String(formData.get("estimatedDays") || "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/delivery");
}

export async function deleteDeliveryZone(formData: FormData) {
  await requireAdminSession();
  const zoneId = String(formData.get("zoneId") || "");
  await prisma.deliveryZone.delete({ where: { id: zoneId } }).catch(() => {});
  revalidatePath("/admin/delivery");
}
