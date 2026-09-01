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
      <div className="relative rounded-3xl overflow-hidden bg-rose-dark text-cream grid lg:grid-cols-2 items-center">
        <div className="p-10 lg:p-14">
          <p className="text-blush font-semibold tracking-wide text-xs uppercase mb-2">Gifting</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4">{title ?? "The perfect gift, ready to give"}</h2>
          <p className="text-cream/80 mb-6 max-w-md">{body}</p>
          <Link
            href="/collections/gift-sets"
            className="inline-block px-6 py-3 rounded-full bg-cream text-ink font-semibold hover:bg-blush transition-colors"
          >
            Shop Gift Sets
          </Link>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full bg-ink/20">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" />
          ) : (
            <PlaceholderImage label="Gift set photo — add in Admin" />
          )}
        </div>
      </div>
    </section>
  );
}
