"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function createDivision(formData: FormData) {
  await requireAdminSession();
  await prisma.division.create({
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      description: String(formData.get("description") || "") || null,
      image: String(formData.get("image") || "") || null,
      isActive: formData.get("isActive") === "on",
      sortOrder: Number(formData.get("sortOrder") || 0),
    },
  });
  revalidatePath("/admin/divisions");
  revalidatePath("/", "layout");
}

export async function updateDivision(divisionId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.division.update({
    where: { id: divisionId },
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      description: String(formData.get("description") || "") || null,
      image: String(formData.get("image") || "") || null,
      isActive: formData.get("isActive") === "on",
      sortOrder: Number(formData.get("sortOrder") || 0),
    },
  });
  revalidatePath("/admin/divisions");
  revalidatePath("/", "layout");
}

export async function deleteDivision(formData: FormData) {
  await requireAdminSession();
  const divisionId = String(formData.get("divisionId") || "");
  await prisma.division.delete({ where: { id: divisionId } }).catch(() => {});
  revalidatePath("/admin/divisions");
  revalidatePath("/", "layout");
}
