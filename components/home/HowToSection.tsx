import SectionHeading from "@/components/home/SectionHeading";

const orderingSteps = [
  "Browse the range and pick your item, size and colour.",
  "Add to basket and checkout securely via Stripe.",
  "We print, pack and dispatch your order.",
  "Track your parcel from My Account until it arrives.",
];

const careSteps = [
  "Check the Care Instructions on each product page before first use.",
  "Printed apparel: wash inside-out on a cold, gentle cycle.",
  "Avoid tumble drying anything with a print or engraving.",
  "Contact us if anything arrives damaged — see our Returns & Refunds Policy.",
];

export default function HowToSection() {
  return (
    <section className="bg-blush/60 py-16">
      <div className="container-page grid md:grid-cols-2 gap-10">
        <div>
          <SectionHeading eyebrow="Guidance" title="How ordering works" />
          <ol className="space-y-3">
            {orderingSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex-none w-6 h-6 rounded-full bg-rose text-ink text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionHeading eyebrow="Guidance" title="Caring for your order" />
          <ol className="space-y-3">
            {careSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex-none w-6 h-6 rounded-full bg-sage text-ink text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
