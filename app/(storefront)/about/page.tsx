import type { Metadata } from "next";
import { getHomepageContent } from "@/lib/settings";
import StorySection from "@/components/home/StorySection";
import WhyShop from "@/components/home/WhyShop";
import { getHomepageFeatures } from "@/lib/settings";

export const metadata: Metadata = { title: "About", description: "The story behind Support Your Local Patriot." };

export default async function AboutPage() {
  const [homepage, features] = await Promise.all([getHomepageContent(), getHomepageFeatures("WHY_SHOP")]);

  return (
    <div>
      <div className="container-page py-14 max-w-2xl">
        <h1 className="font-display text-4xl mb-4">About Support Your Local Patriot</h1>
        <p className="text-ink-soft leading-relaxed">
          Support Your Local Patriot is a small, UK-based business printing hoodies, tees, accessories and gifts,
          in small batches, with care taken over every step.
        </p>
      </div>
      <StorySection title={homepage.storyTitle} body={homepage.storyBody} image={homepage.storyImage} />
      <WhyShop features={features} />
    </div>
  );
}
