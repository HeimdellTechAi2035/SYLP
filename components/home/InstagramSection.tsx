import SectionHeading from "@/components/home/SectionHeading";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export default function InstagramSection({ instagramUrl }: { instagramUrl?: string | null }) {
  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Follow along" title="@handmadebymia" align="center" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden">
            <PlaceholderImage />
          </div>
        ))}
      </div>
      {instagramUrl && (
        <div className="text-center mt-6">
          <a href={instagramUrl} className="text-rose-dark font-semibold text-sm hover:text-ink">
            View on Instagram &rarr;
          </a>
        </div>
      )}
    </section>
  );
}
