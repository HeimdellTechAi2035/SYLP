export default function MemberCallout({ supportEmail }: { supportEmail?: string | null }) {
  if (!supportEmail) return null;

  return (
    <div className="mt-8 rounded-2xl border border-rose-dark/40 bg-blush px-6 py-5 max-w-md mx-auto lg:mx-0">
      <p className="font-display text-lg text-ink mb-1">Patriot Members</p>
      <p className="text-sm text-ink-soft mb-3">
        Email us for your member hoodies and t-shirts. Your name, phone number, sizes and location must be included.
      </p>
      <a
        href={`mailto:${supportEmail}`}
        className="inline-block px-5 py-2 rounded-full bg-rose text-ink font-semibold text-sm hover:bg-rose-dark transition-colors"
      >
        Email {supportEmail}
      </a>
    </div>
  );
}
