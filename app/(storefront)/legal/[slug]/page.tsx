import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function generateStaticParams() {
  const policies = await prisma.policy.findMany({ select: { slug: true } });
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = await prisma.policy.findUnique({ where: { slug } });
  return { title: policy?.title ?? "Policy" };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await prisma.policy.findUnique({ where: { slug } });
  if (!policy) notFound();

  return (
    <div className="container-page py-14 max-w-3xl mx-auto">
      {policy.isDraft && (
        <div className="bg-gold/20 border border-gold text-ink text-sm rounded-lg p-3 mb-6">
          <strong>Draft placeholder:</strong> this policy has not yet been reviewed or finalised. Do not treat it as legally binding.
        </div>
      )}
      <h1 className="font-display text-3xl sm:text-4xl mb-2">{policy.title}</h1>
      <p className="text-xs text-ink-soft mb-8">Last updated {policy.lastUpdated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div className="whitespace-pre-line text-ink-soft leading-relaxed">{policy.body}</div>
    </div>
  );
}
