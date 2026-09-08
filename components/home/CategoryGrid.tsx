import Link from "next/link";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import SectionHeading from "@/components/home/SectionHeading";

type CategoryTile = { name: string; slug: string; image: string | null };

export default function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Shop by category" title="Find your favourite" align="center" />
      {/* flex-wrap + justify-center (not a grid) so an odd category count's
          leftover last-row tile centers itself instead of staying pinned to
          the grid's first column. */}
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/collections/${cat.slug}`}
            className="group relative w-[calc(50%-0.5rem)] sm:w-[calc(25%-0.75rem)] aspect-[4/5] rounded-2xl overflow-hidden bg-blush"
          >
            {cat.image ? (
              <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <PlaceholderImage />
            )}
            {/* White text is legible here only because of this dark scrim over
                an arbitrary admin-uploaded photo — swapping to black text would
                fail contrast against the gradient far worse than this does. */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-white font-display text-lg">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
