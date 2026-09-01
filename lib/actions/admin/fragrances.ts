"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || "") || null,
    scentFamily: String(formData.get("scentFamily") || "") || null,
    topNotes: String(formData.get("topNotes") || "") || null,
    heartNotes: String(formData.get("heartNotes") || "") || null,
    baseNotes: String(formData.get("baseNotes") || "") || null,
    image: String(formData.get("image") || "") || null,
    internalNotes: String(formData.get("internalNotes") || "") || null,
    isActive: formData.get("isActive") === "on",
    isSeasonal: formData.get("isSeasonal") === "on",
  };
}

export async function createFragrance(formData: FormData) {
  await requireAdminSession();
  await prisma.fragrance.create({ data: readForm(formData) });
  revalidatePath("/admin/fragrances");
  revalidatePath("/", "layout");
}

export async function updateFragrance(fragranceId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.fragrance.update({ where: { id: fragranceId }, data: readForm(formData) });
  revalidatePath("/admin/fragrances");
  revalidatePath("/", "layout");
}

export async function deleteFragrance(formData: FormData) {
  await requireAdminSession();
  const fragranceId = String(formData.get("fragranceId") || "");
  await prisma.fragrance.delete({ where: { id: fragranceId } }).catch(() => {});
  revalidatePath("/admin/fragrances");
}
