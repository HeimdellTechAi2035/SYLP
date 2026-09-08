import { getProductKnowledge, type PublicProductKnowledge } from "@/lib/knowledge/products";
import { getFaqKnowledge, type FaqKnowledge } from "@/lib/knowledge/faq";

export type KnowledgeSearchResult = {
  products: PublicProductKnowledge[];
  faqs: FaqKnowledge[];
};

/**
 * Plain keyword search over already-public knowledge (published products,
 * their category, and published FAQs). No vector database or
 * embeddings — with a catalogue this size a direct filter is fast enough,
 * and it's trivially correct: whatever getProductKnowledge()/getFaqKnowledge()
 * would allow is exactly what search can surface, no separate index to
 * fall out of sync with the database.
 */
export async function searchKnowledge(query: string): Promise<KnowledgeSearchResult> {
  const q = query.trim().toLowerCase();
  if (!q) return { products: [], faqs: [] };

  const [products, faqs] = await Promise.all([getProductKnowledge(), getFaqKnowledge()]);

  const matchedProducts = products.filter((p) =>
    [p.name, p.shortDescription, p.description, p.category, p.productType]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q))
  );

  const matchedFaqs = faqs.filter(
    (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );

  return { products: matchedProducts, faqs: matchedFaqs };
}
