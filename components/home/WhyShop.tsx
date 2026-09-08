import { Sparkles, Package, Gift, ShieldCheck, Truck } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  package: Package,
  gift: Gift,
  shield: ShieldCheck,
  truck: Truck,
};

export type Feature = { icon: string | null; title: string; body: string | null };

const defaultFeatures: Feature[] = [
  { icon: "sparkles", title: "Handmade", body: "Every item is poured and finished by hand in small batches." },
  { icon: "package", title: "Small-batch", body: "We make in limited runs rather than mass production." },
  { icon: "gift", title: "Giftable", body: "Thoughtful packaging that's ready to give." },
  { icon: "shield", title: "Secure checkout", body: "Payments are processed securely via Stripe." },
  { icon: "truck", title: "UK delivery", body: "Dispatched from the UK — get in touch if you'd like tracking added." },
];

export default function WhyShop({ features }: { features?: Feature[] }) {
  const items = features && features.length > 0 ? features : defaultFeatures;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Why Support Your Local Patriot" title="Made with care, start to finish" align="center" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map((feature, i) => {
          const Icon = (feature.icon && iconMap[feature.icon]) || Sparkles;
          return (
            <div key={i} className="text-center flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-blush text-rose-dark">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-sm">{feature.title}</h3>
              {feature.body && <p className="text-xs text-ink-soft">{feature.body}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
