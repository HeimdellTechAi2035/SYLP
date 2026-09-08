import Link from "next/link";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import MemberCallout from "@/components/home/MemberCallout";

export default function Hero({
  title,
  subtitle,
  image,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  supportEmail,
}: {
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
  supportEmail?: string | null;
}) {
  return (
    <section className="container-page pt-8 sm:pt-12 pb-16">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <p className="text-rose-dark font-semibold tracking-wide text-sm uppercase mb-3">
            Printed in the UK
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-ink">
            {title ?? "Support Your Local Patriot — wear your colours"}
          </h1>
          <p className="mt-5 text-ink-soft text-lg max-w-xl mx-auto lg:mx-0">
            {subtitle ?? "Hoodies, tees and everyday gear, printed and packed to order in the UK."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              href={primaryHref ?? "/collections/hoodies"}
              className="px-6 py-3 rounded-full bg-rose text-ink font-semibold hover:bg-rose-dark transition-colors"
            >
              {primaryLabel ?? "Shop Hoodies"}
            </Link>
            <Link
              href={secondaryHref ?? "/shop"}
              className="px-6 py-3 rounded-full bg-blush text-ink font-semibold border border-ink/10 hover:border-ink/30 transition-colors"
            >
              {secondaryLabel ?? "Shop All"}
            </Link>
          </div>

          <MemberCallout supportEmail={supportEmail} />
        </div>

        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-blush">
          {image ? (
            <Image src={image} alt="" fill priority className="object-cover" />
          ) : (
            <PlaceholderImage />
          )}
        </div>
      </div>
    </section>
  );
}
