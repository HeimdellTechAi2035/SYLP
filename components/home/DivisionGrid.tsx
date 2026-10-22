import Link from "next/link";
import Image from "next/image";
import { Shield, ChevronRight } from "lucide-react";

type DivisionTile = {
  name: string;
  slug: string;
  /** The division's own logo/badge, set in Admin -> Divisions. */
  logo: string | null;
  /** Fallback when there's no logo yet: first product photo. */
  photo: string | null;
  productCount: number;
};

/**
 * The homepage's main way in: one box per NorthWest Patriots division, each
 * leading to that division's own merch page.
 *
 * Built phone-first (nearly all customers are on mobile): two tiles per row
 * so every division fits on roughly one screen; an odd last tile is centred
 * rather than left hanging. Division logos already carry the name, so the
 * logo sits uncropped on black with the name in a strip underneath instead
 * of text printed over the artwork. The whole tile is the tap target.
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
          <li key={d.slug} className="max-lg:[&:last-child:nth-child(odd)]:col-span-2">
            <Link
              href={`/divisions/${d.slug}`}
              className="group flex flex-col h-full mx-auto max-lg:[li:last-child:nth-child(odd)_&]:w-[calc(50%-0.375rem)] rounded-2xl overflow-hidden bg-blush ring-1 ring-ink/10 active:scale-[0.98] hover:ring-rose transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
            >
              <div className="relative aspect-square bg-black">
                {d.logo ? (
                  <Image
                    src={d.logo}
                    alt={`${d.name} logo`}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : d.photo ? (
                  <Image
                    src={d.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-rose-dark via-blush to-cloud" aria-hidden>
                    <Shield className="h-12 w-12 text-ink/30" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-ink leading-tight">{d.name}</h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {d.productCount > 0
                      ? `${d.productCount} item${d.productCount === 1 ? "" : "s"}`
                      : "Coming soon"}
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 shrink-0 rounded-full bg-rose text-white p-1" aria-hidden />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
