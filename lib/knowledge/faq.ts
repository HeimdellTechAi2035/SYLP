import { prisma } from "@/lib/prisma";

export type FaqKnowledge = { id: string; question: string; answer: string; category: string };

/** Published FAQs only — isActive is the same flag the /faq storefront page filters on. */
export async function getFaqKnowledge(): Promise<FaqKnowledge[]> {
  const items = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return items.map((i) => ({ id: i.id, question: i.question, answer: i.answer, category: i.category }));
}
