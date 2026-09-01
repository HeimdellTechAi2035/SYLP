export default function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-8 ${align === "center" ? "text-center max-w-2xl mx-auto" : ""}`}>
      {eyebrow && (
        <p className="text-rose-dark font-semibold tracking-wide text-xs uppercase mb-2">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl text-ink">{title}</h2>
      {body && <p className="mt-3 text-ink-soft">{body}</p>}
    </div>
  );
}
