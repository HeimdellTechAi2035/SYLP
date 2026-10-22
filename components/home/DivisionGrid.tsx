import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";

type DivisionTile = {
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};

/**
 * The homepage's main way in: one box per NorthWest Patriots division, each
 * leading to that division's own merch page.
 */
export default function DivisionGrid({ divisions }: { divisions: DivisionTile[] }) {
  if (divisions.length === 0) return null;

  return (
    <section id="divisions" className="container-page py-16 scroll-mt-24">
      <SectionHeading
        eyebrow="Choose your division"
        title="Merch for every corner of the North West"
        body="Pick your division to see its own hoodies, tees and gear."
        align="center"
      />
      {/* flex-wrap + justify-center so a 3 + 2 last row centres itself. */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {divisions.map((d) => (
          <Link
            key={d.slug}
            href={`/divisions/${d.slug}`}
            className="group relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] aspect-[16/10] rounded-2xl overflow-hidden bg-blush ring-1 ring-ink/10 hover:ring-rose transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
          >
            {d.image ? (
              <Image
                src={d.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-rose-dark via-blush to-cloud"
                aria-hidden
              >
                <Shield className="absolute right-4 top-4 h-16 w-16 text-ink/15" strokeWidth={1.5} />
              </div>
            )}
            {/* Dark scrim keeps the light text readable over any uploaded photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl text-white leading-tight">{d.name}</h3>
                <p className="text-sm text-white/80 mt-1">
                  {d.productCount > 0
                    ? `${d.productCount} item${d.productCount === 1 ? "" : "s"}`
                    : "Merch coming soon"}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose px-3 py-1.5 text-sm font-semibold text-white group-hover:bg-rose-dark transition-colors">
                Shop <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
