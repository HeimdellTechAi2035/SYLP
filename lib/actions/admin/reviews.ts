"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function setReviewStatus(reviewId: string, status: string) {
  await requireAdminSession();
  const review = await prisma.review.update({ where: { id: reviewId }, data: { status }, include: { product: true } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${review.product.slug}`);
  revalidatePath("/", "layout");
}

export async function respondToReview(reviewId: string, formData: FormData) {
  await requireAdminSession();
  const merchantResponse = String(formData.get("merchantResponse") || "");
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { merchantResponse: merchantResponse || null },
    include: { product: true },
  });
  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${review.product.slug}`);
}
