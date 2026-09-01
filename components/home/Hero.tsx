import Link from "next/link";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function Hero({
  title,
  subtitle,
  image,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
}) {
  return (
    <section className="container-page pt-8 sm:pt-12 pb-16">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-rose-dark font-semibold tracking-wide text-sm uppercase mb-3">
            Handmade in the UK
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-ink">
            {title ?? "Beautiful home fragrance, handmade by Mia"}
          </h1>
          <p className="mt-5 text-ink-soft text-lg max-w-xl">
            {subtitle ?? "Small-batch wax melts and candles, poured and packed by hand."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryHref ?? "/collections/wax-melts"}
              className="px-6 py-3 rounded-full bg-rose-dark text-cream font-semibold hover:bg-ink transition-colors"
            >
              {primaryLabel ?? "Shop Wax Melts"}
            </Link>
            <Link
              href={secondaryHref ?? "/collections/candles"}
              className="px-6 py-3 rounded-full bg-white text-ink font-semibold border border-ink/10 hover:border-ink/30 transition-colors"
            >
              {secondaryLabel ?? "Shop Candles"}
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-blush">
          {image ? (
            <Image src={image} alt="" fill priority className="object-cover" />
          ) : (
            <PlaceholderImage label="Hero photo — add in Admin > Homepage" />
          )}
        </div>
      </div>
    </section>
  );
}
