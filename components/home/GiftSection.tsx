import Link from "next/link";
import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function GiftSection({
  title,
  body,
  image,
}: {
  title?: string | null;
  body?: string | null;
  image?: string | null;
}) {
  return (
    <section className="container-page py-16">
      <div className="relative rounded-3xl overflow-hidden bg-rose-dark text-ink grid lg:grid-cols-2 items-center border border-ink/15">
        <div className="p-10 lg:p-14 text-center lg:text-left">
          <p className="text-ink/80 font-semibold tracking-wide text-xs uppercase mb-2">Gifting</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{title ?? "The perfect gift, ready to give"}</h2>
          <p className="text-ink/90 mb-6 max-w-md mx-auto lg:mx-0">{body}</p>
          <Link
            href="/collections/gift-sets"
            className="inline-block px-6 py-3 rounded-full bg-blush text-ink border border-ink/20 font-semibold hover:bg-cream transition-colors"
          >
            Shop Gift Sets
          </Link>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full bg-ink/20">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" />
          ) : (
            <PlaceholderImage />
          )}
        </div>
      </div>
    </section>
  );
}
