import { prisma } from "@/lib/prisma";
import { getHomepageContent, getHomepageFeatures, getSiteSettings } from "@/lib/settings";
import {
  getDivisions,
  getShopProducts,
} from "@/lib/queries/products";
import Hero from "@/components/home/Hero";
import DivisionGrid from "@/components/home/DivisionGrid";
import ProductSection from "@/components/home/ProductSection";
import StorySection from "@/components/home/StorySection";
import WhyShop from "@/components/home/WhyShop";
import HowToSection from "@/components/home/HowToSection";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import SectionHeading from "@/components/home/SectionHeading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [homepage, settings, features, faqs, divisions, allProducts] =
    await Promise.all([
      getHomepageContent(),
      getSiteSettings(),
      getHomepageFeatures("WHY_SHOP"),
      prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
      getDivisions(),
      getShopProducts({}),
    ]);

  return (
    <>
      <Hero
        title={homepage.heroTitle}
        subtitle={homepage.heroSubtitle}
        image={homepage.heroImage}
        primaryLabel={homepage.heroCtaPrimaryLabel}
        primaryHref={homepage.heroCtaPrimaryHref}
        secondaryLabel={homepage.heroCtaSecondaryLabel}
        secondaryHref={homepage.heroCtaSecondaryHref}
        supportEmail={settings.supportEmail}
      />

      {/* Division boxes only show if any divisions are switched on in Admin. */}
      {divisions.length > 0 && (
        <DivisionGrid
          divisions={divisions.map((d) => ({
            name: d.name,
            slug: d.slug,
            logo: d.image,
            photo: d.products[0]?.mainImage ?? null,
            productCount: d._count.products,
          }))}
        />
      )}

      {/* The whole range, straight under the hero (the shop is small for now). */}
      <ProductSection
        products={allProducts.slice(0, 8)}
        eyebrow="Shop"
        title="The range"
        viewAllHref="/shop"
        emptyMessage="New products are landing soon. Check back shortly."
      />

      <StorySection title={homepage.storyTitle} body={homepage.storyBody} image={homepage.storyImage} />

      <WhyShop features={features} />

      <HowToSection />

      <section className="container-page py-16 max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <Link href="/faq" className="text-sm font-semibold text-rose-dark hover:text-ink shrink-0 mb-8">
            View all &rarr;
          </Link>
        </div>
        <FaqAccordion items={faqs} />
      </section>
    </>
  );
}
