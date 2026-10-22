import Link from "next/link";
import Image from "next/image";
import { Shield, ChevronRight } from "lucide-react";

type DivisionTile = {
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};

/**
 * The homepage's main way in: one box per NorthWest Patriots division, each
 * leading to that division's own merch page.
 *
 * Built phone-first (nearly all customers are on mobile): two square tiles
 * per row so every division fits on roughly one screen, with an odd last
 * tile stretched full-width rather than left hanging. The whole tile is the
 * tap target. On large screens all divisions sit in a single row.
 */
export default function DivisionGrid({ divisions }: { divisions: DivisionTile[] }) {
  if (divisions.length === 0) return null;

  return (
    <section id="divisions" className="container-page pt-6 pb-10 sm:py-14 scroll-mt-20">
      <div className="mb-5 sm:mb-8 text-center">
        <p className="text-rose font-semibold tracking-wide text-xs uppercase mb-1.5">Choose your division</p>
        <h2 className="font-display text-2xl sm:text-4xl text-ink leading-tight">
          Merch for every corner of the North West
        </h2>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {divisions.map((d) => (
          <li
            key={d.slug}
            className="max-lg:[&:last-child:nth-child(odd)]:col-span-2"
          >
            <Link
              href={`/divisions/${d.slug}`}
              className="group relative block h-full min-h-40 aspect-square max-lg:[li:last-child:nth-child(odd)_&]:aspect-[2/1] rounded-2xl overflow-hidden bg-blush ring-1 ring-ink/10 active:scale-[0.98] hover:ring-rose transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
            >
              {d.image ? (
                <Image
                  src={d.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-rose-dark via-blush to-cloud" aria-hidden>
                  <Shield className="absolute right-3 top-3 h-10 w-10 text-ink/15" strokeWidth={1.5} />
                </div>
              )}
              {/* Dark scrim keeps the light text readable over any uploaded photo. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="font-display text-lg sm:text-xl text-white leading-tight">{d.name}</h3>
                <p className="mt-1 flex items-center justify-between gap-2 text-xs sm:text-sm text-white/80">
                  <span>
                    {d.productCount > 0
                      ? `${d.productCount} item${d.productCount === 1 ? "" : "s"}`
                      : "Coming soon"}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 rounded-full bg-rose text-white p-0.5" aria-hidden />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
