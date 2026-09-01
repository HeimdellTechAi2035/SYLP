"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";

export type ReviewFormState = { status: "idle" | "success" | "error"; message?: string };

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") || "",
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fill in all required fields with a valid rating." };
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return { status: "error", message: "Product not found." };

  // A review only counts as a verified purchase if this email appears on a paid order for this product.
  const verifiedPurchase = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { email: parsed.data.customerEmail, paymentStatus: "PAID" },
    },
  });

  await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      verifiedPurchase: Boolean(verifiedPurchase),
      status: "PENDING",
    },
  });

  revalidatePath(`/products/${product.slug}`);

  return { status: "success", message: "Thanks! Your review has been submitted and will appear once approved." };
}
