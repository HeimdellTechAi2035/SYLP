"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function createCategory(formData: FormData) {
  await requireAdminSession();
  await prisma.category.create({
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      description: String(formData.get("description") || "") || null,
      image: String(formData.get("image") || "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      description: String(formData.get("description") || "") || null,
      image: String(formData.get("image") || "") || null,
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function deleteCategory(formData: FormData) {
  await requireAdminSession();
  const categoryId = String(formData.get("categoryId") || "");
  await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
