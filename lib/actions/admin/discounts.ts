"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function readForm(formData: FormData) {
  const startDate = formData.get("startDate") ? new Date(String(formData.get("startDate"))) : null;
  const endDate = formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null;
  const type = String(formData.get("type") || "FIXED");
  const rawValue = Number(formData.get("value") || 0);

  return {
    code: String(formData.get("code") || "").toUpperCase().trim(),
    type,
    value: type === "FIXED" ? Math.round(rawValue * 100) : Math.round(rawValue),
    minimumSpend: formData.get("minimumSpend") ? Math.round(Number(formData.get("minimumSpend")) * 100) : null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    perCustomerLimit: formData.get("perCustomerLimit") ? Number(formData.get("perCustomerLimit")) : null,
    startDate,
    endDate,
    isActive: formData.get("isActive") === "on",
  };
}

export async function createDiscount(formData: FormData) {
  await requireAdminSession();
  await prisma.discount.create({ data: readForm(formData) });
  revalidatePath("/admin/discounts");
}

export async function updateDiscount(discountId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.discount.update({ where: { id: discountId }, data: readForm(formData) });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(formData: FormData) {
  await requireAdminSession();
  const discountId = String(formData.get("discountId") || "");
  await prisma.discount.delete({ where: { id: discountId } }).catch(() => {});
  revalidatePath("/admin/discounts");
}
