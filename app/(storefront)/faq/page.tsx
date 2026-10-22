import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { jsonLd } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about NorthWest Patriots merch: delivery times, free delivery, sizing, washing, returns and made-to-order items.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container-page py-14 max-w-3xl mx-auto">
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: items.map((i) => ({
                "@type": "Question",
                name: i.question,
                acceptedAnswer: { "@type": "Answer", text: i.answer },
              })),
            }),
          }}
        />
      )}
      <h1 className="font-display text-3xl sm:text-4xl mb-8">Frequently Asked Questions</h1>
      {Object.keys(grouped).length === 0 && <p className="text-ink-soft">FAQs will appear here once added in Admin.</p>}
      {Object.entries(grouped).map(([category, entries]) => (
        <div key={category} className="mb-10">
          <h2 className="font-display text-xl mb-3">{category}</h2>
          <FaqAccordion items={entries} />
        </div>
      ))}
    </div>
  );
}
