import { prisma } from "@/lib/prisma";
import { getHomepageContent, getHomepageFeatures, getSiteSettings } from "@/lib/settings";
import {
  getBestSellers,
  getFeaturedProducts,
  getCategories,
} from "@/lib/queries/products";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSection from "@/components/home/ProductSection";
import StorySection from "@/components/home/StorySection";
import WhyShop from "@/components/home/WhyShop";
import GiftSection from "@/components/home/GiftSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import HowToSection from "@/components/home/HowToSection";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import SectionHeading from "@/components/home/SectionHeading";
import Link from "next/link";

export default async function HomePage() {
  const [homepage, settings, bestSellers, featured, categories, features, faqs, reviews] =
    await Promise.all([
      getHomepageContent(),
      getSiteSettings(),
      getBestSellers(8),
      getFeaturedProducts(8),
      getCategories(),
      getHomepageFeatures("WHY_SHOP"),
      prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { product: { select: { name: true, slug: true } } },
      }),
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

      <CategoryGrid
        categories={categories.map((c) => ({ name: c.name, slug: c.slug, image: c.image ?? c.products[0]?.mainImage ?? null }))}
      />

      <ProductSection
        products={bestSellers}
        eyebrow="Best Sellers"
        title="Loved by our customers"
        viewAllHref="/collections/best-sellers"
        emptyMessage="Mark products as best sellers in Admin to feature them here."
      />

      <ProductSection
        products={featured}
        eyebrow="Featured"
        title="Featured this month"
        viewAllHref="/shop"
        emptyMessage="Mark products as featured in Admin to feature them here."
      />

      <StorySection title={homepage.storyTitle} body={homepage.storyBody} image={homepage.storyImage} />

      <WhyShop features={features} />

      <GiftSection title={homepage.giftSectionTitle} body={homepage.giftSectionBody} image={homepage.giftSectionImage} />

      <ReviewsSection reviews={reviews} />

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
