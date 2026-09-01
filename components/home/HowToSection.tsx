import SectionHeading from "@/components/home/SectionHeading";

const waxMeltSteps = [
  "Snap off one or two cubes of wax melt.",
  "Place them in the dish of a wax warmer.",
  "Turn on your electric warmer, or light a tea light underneath.",
  "Enjoy the fragrance as the wax melts — let it cool fully before changing scents.",
];

const candleCareSteps = [
  "Trim the wick to 5mm before every burn.",
  "On the first burn, let the wax melt across the full surface to avoid tunnelling.",
  "Burn for no more than 4 hours at a time.",
  "Keep away from draughts, children, pets and anything flammable.",
];

export default function HowToSection() {
  return (
    <section className="bg-white/60 py-16">
      <div className="container-page grid md:grid-cols-2 gap-10">
        <div>
          <SectionHeading eyebrow="Guidance" title="How to use wax melts" />
          <ol className="space-y-3">
            {waxMeltSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex-none w-6 h-6 rounded-full bg-rose text-white text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionHeading eyebrow="Guidance" title="Candle care" />
          <ol className="space-y-3">
            {candleCareSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex-none w-6 h-6 rounded-full bg-sage text-white text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
