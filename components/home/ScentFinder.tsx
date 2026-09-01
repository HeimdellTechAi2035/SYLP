import Link from "next/link";
import SectionHeading from "@/components/home/SectionHeading";

export default function ScentFinder({ families }: { families: string[] }) {
  if (families.length === 0) return null;

  return (
    <section className="bg-white/60 py-16">
      <div className="container-page">
        <SectionHeading eyebrow="Fragrance discovery" title="Shop by scent family" align="center" />
        <div className="flex flex-wrap justify-center gap-3">
          {families.map((family) => (
            <Link
              key={family}
              href={`/shop?scent=${encodeURIComponent(family)}`}
              className="px-5 py-2.5 rounded-full bg-cream border border-ink/10 font-medium text-sm hover:bg-blush hover:border-rose transition-colors"
            >
              {family}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
