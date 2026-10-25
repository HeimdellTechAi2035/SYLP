import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  return {
    title: policy?.title ?? "Policy",
    description: policy ? `${policy.title} for Support Your Local Patriot, the online merch shop run by Heimdell Tech Ai Ltd.` : undefined,
    alternates: { canonical: `/legal/${slug}` },
  };
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
      {slug === "privacy" && <p className="my-4 rounded-xl border border-ink/20 p-4 text-sm">For registration, incident reports, private information and donation offers, also read our <Link href="/community/privacy" className="underline">community submission privacy notice</Link>.</p>}
      <p className="text-xs text-ink-soft mb-8">Last updated {policy.lastUpdated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      {["privacy", "cookies"].includes(slug) && <section className="mb-6 rounded-xl border border-ink/20 p-4 text-sm"><h2 className="font-semibold mb-2">Website visitor statistics</h2><p>With analytics consent, we record page views and estimate visits using a random identifier stored in this browser tab. A new visit starts after 30 minutes without a tracked page load. These statistics do not store your name, email address, IP address, query strings or form contents. Private community forms, account pages and checkout are excluded. Choose Necessary Only to browse without this analytics tracking.</p></section>}
      <div className="whitespace-pre-line text-ink-soft leading-relaxed">{policy.body}</div>
    </div>
  );
}
