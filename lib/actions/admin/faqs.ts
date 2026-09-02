"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function faqData(formData: FormData) {
  return {
    question: String(formData.get("question") || ""),
    answer: String(formData.get("answer") || ""),
    category: String(formData.get("category") || "General"),
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };
}

export async function createFaq(formData: FormData) {
  await requireAdminSession();
  await prisma.faqItem.create({ data: faqData(formData) });
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

export async function updateFaq(faqId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.faqItem.update({ where: { id: faqId }, data: faqData(formData) });
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

export async function deleteFaq(formData: FormData) {
  await requireAdminSession();
  const faqId = String(formData.get("faqId") || "");
  await prisma.faqItem.delete({ where: { id: faqId } }).catch(() => {});
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

/** Pre-fills a new FAQ from an unanswered question, and marks that question resolved once saved. */
export async function createFaqFromUnansweredQuestion(unansweredQuestionId: string, formData: FormData) {
  await requireAdminSession();
  const faq = await prisma.faqItem.create({ data: faqData(formData) });
  await prisma.unansweredQuestion.update({ where: { id: unansweredQuestionId }, data: { resolvedFaqId: faq.id } });
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

export async function dismissUnansweredQuestion(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  await prisma.unansweredQuestion.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/faqs");
}
