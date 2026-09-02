import { prisma } from "@/lib/prisma";

export type PolicyKnowledge = { slug: string; title: string; body: string };

/** Published policies only — a draft policy (isDraft: true) is never customer-facing, same rule the /legal/[slug] page uses. */
export async function getPolicyKnowledge(): Promise<PolicyKnowledge[]> {
  const policies = await prisma.policy.findMany({ where: { isDraft: false } });
  return policies.map((p) => ({ slug: p.slug, title: p.title, body: p.body }));
}

export async function getPolicyKnowledgeBySlug(slug: string): Promise<PolicyKnowledge | null> {
  const policy = await prisma.policy.findUnique({ where: { slug } });
  if (!policy || policy.isDraft) return null;
  return { slug: policy.slug, title: policy.title, body: policy.body };
}
