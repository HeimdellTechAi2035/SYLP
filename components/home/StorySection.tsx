import Image from "next/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function StorySection({
  title,
  body,
  image,
}: {
  title?: string | null;
  body?: string | null;
  image?: string | null;
}) {
  return (
    <section className="bg-blush/60 py-16">
      <div className="container-page grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-blush order-2 lg:order-1">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" />
          ) : (
            <PlaceholderImage />
          )}
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-rose-dark font-semibold tracking-wide text-xs uppercase mb-2">Our story</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-4">{title ?? "Support Your Local Patriot"}</h2>
          <p className="text-ink-soft leading-relaxed whitespace-pre-line">{body}</p>
        </div>
      </div>
    </section>
  );
}
