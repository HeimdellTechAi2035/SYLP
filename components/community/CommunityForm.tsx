"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { submitCommunity, type CommunityState } from "@/lib/actions/community";
import { communityPages, incidentCategories, type CommunityKind } from "@/lib/community/config";

const initial: CommunityState = { status: "idle" };
const inputClass = "w-full min-h-12 rounded-xl border border-ink/25 bg-blush px-3 py-3 text-base text-ink focus-visible:outline-rose";

export default function CommunityForm({ kind }: { kind: CommunityKind }) {
  const [state, action, pending] = useActionState(async (previous: CommunityState, data: FormData): Promise<CommunityState> => {
    try { return await submitCommunity(previous, data); }
    catch { return { status: "error", message: "We couldn't confirm that your submission was saved. Please try again; if you attached files, try smaller files or send the text first." }; }
  }, initial);
  const optionalContact = kind === "whistleblower" || kind === "incident";
  const [anonymous, setAnonymous] = useState(optionalContact);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState("");
  const page = communityPages[kind];
  const change = (name: string, value: string) => setValues(v => ({ ...v, [name]: value }));

  if (state.status === "success") return (
    <div role="status" className="rounded-2xl border border-gold/50 bg-blush p-6 sm:p-8 space-y-4">
      <h2 className="font-display text-2xl">Thank you</h2>
      <p>{state.message}</p>
      {state.reference && <p className="break-all"><strong>Your reference: {state.reference}</strong></p>}
      <Link href="/#community" className="inline-flex min-h-12 items-center rounded-full bg-rose text-cream px-6 py-3 font-semibold">Back to SYLP</Link>
    </div>
  );

  function field(name: string, label: string, options: { required?: boolean; type?: string; autoComplete?: string; maxLength?: number } = {}) {
    return <div><label htmlFor={name} className="block font-medium text-sm mb-2">{label}</label>
      <input id={name} name={name} value={values[name] ?? ""} onChange={e => change(name, e.target.value)}
        type={options.type ?? "text"} required={options.required} autoComplete={options.autoComplete ?? "off"}
        maxLength={options.maxLength ?? 120} className={inputClass} /></div>;
  }
  return (
    <form action={action} className="space-y-6 min-w-0">
      <input type="hidden" name="kind" value={kind} />
      <div className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="community-website">Leave this empty</label><input id="community-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {optionalContact && (
        <div className="rounded-xl bg-blush border border-ink/15 p-4">
          <label className="flex items-start gap-3 min-h-12 cursor-pointer">
            <input type="checkbox" name="anonymous" value="yes" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#d94e4e]" />
            <span><strong>Submit without contact details</strong><span className="block text-sm text-ink-soft mt-1">Uncheck this if you would like to leave an email for a reply.</span></span>
          </label>
          <p className="text-xs text-ink-soft mt-2">Leaving your name blank does not guarantee anonymity. The hosting service may process technical connection records. Avoid identifying yourself in your message if you do not want to.</p>
        </div>
      )}
      {!anonymous && (
        <fieldset className="space-y-4"><legend className="font-semibold mb-3">Your contact details</legend>
          {field("name", optionalContact ? "Name (optional)" : "Name", { required: !optionalContact, autoComplete: optionalContact ? "off" : "name" })}
          {field("email", "Email", { required: true, type: "email", autoComplete: optionalContact ? "off" : "email", maxLength: 254 })}
          {field("phone", "Phone (optional)", { type: "tel", autoComplete: optionalContact ? "off" : "tel", maxLength: 40 })}
        </fieldset>
      )}
      {(kind === "register" || kind === "donation") && field("area", "Town or postcode area", { required: true })}
      {kind === "register" && <div><label htmlFor="interest" className="block font-medium text-sm mb-2">How would you like to help?</label>
        <select id="interest" name="interest" value={values.interest ?? ""} onChange={e => change("interest", e.target.value)} className={inputClass} required>
          <option value="">Choose an option</option><option>Volunteering</option><option>Community activities</option><option>Helping with donations</option><option>Offering skills or support</option><option>Something else</option>
        </select></div>}
      {kind === "donation" && <div><label htmlFor="fulfilment" className="block font-medium text-sm mb-2">Collection or drop-off?</label>
        <select id="fulfilment" name="fulfilment" value={values.fulfilment ?? ""} onChange={e => change("fulfilment", e.target.value)} className={inputClass} required>
          <option value="">Choose an option</option><option value="collection">Request collection</option><option value="drop-off">Arrange a drop-off</option><option value="discuss">Discuss arrangements with me</option>
        </select><p className="text-sm text-ink-soft mt-2">Please do not leave items or travel to a drop-off point until the team confirms the arrangements.</p></div>}
      {kind === "incident" && <fieldset className="space-y-4"><legend className="font-semibold mb-3">Incident details</legend>
        {field("address", "House number and street where it happened", { required: true, maxLength: 160 })}
        {field("town", "Town", { required: true, maxLength: 80 })}
        {field("postcode", "UK postcode of the incident", { required: true, maxLength: 9 })}
        <div><label htmlFor="incidentCategory" className="block font-medium text-sm mb-2">Type of incident</label>
          <select id="incidentCategory" name="incidentCategory" required value={values.incidentCategory ?? ""} onChange={e => change("incidentCategory", e.target.value)} className={inputClass}>
            <option value="">Choose an option</option>{Object.entries(incidentCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></div>
        <div><label htmlFor="occurredOn" className="block font-medium text-sm mb-2">When did it happen? (optional)</label>
          <input id="occurredOn" name="occurredOn" type="date" max={new Date().toISOString().slice(0,10)} value={values.occurredOn ?? ""} onChange={e => change("occurredOn", e.target.value)} className={inputClass} /></div>
      </fieldset>}
      <div><label htmlFor="message" className="block font-medium text-sm mb-2">{kind === "donation" ? "Items, quantities and condition" : kind === "incident" ? "What happened?" : kind === "register" ? "Tell us a little about how you would like to get involved" : "Information you would like reviewed"}</label>
        <textarea id="message" name="message" required minLength={20} maxLength={2800} rows={7} value={values.message ?? ""} onChange={e => change("message", e.target.value)} className={inputClass} aria-describedby="message-help" />
        <p id="message-help" className="text-sm text-ink-soft mt-2">{optionalContact ? "Stick to factual details and explain what you know first-hand. Leave out unnecessary personal information about yourself or other people." : kind === "donation" ? "Sleeping bags, tents and warm clothing are welcome offers. Tell us what you have and when you are available." : "Please do not include sensitive identity documents or financial details."}</p>
      </div>
      {kind === "incident" && <div>
        <label htmlFor="evidence" className="block font-medium text-sm mb-2">Photos or short videos (optional)</label>
        <input id="evidence" name="evidence" type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className={inputClass}
          onChange={e => { const files = [...(e.target.files ?? [])]; setFileError(files.length > 3 || files.reduce((n,f) => n + f.size,0) > 6*1024*1024 ? "Choose up to 3 files, no more than 6 MB combined." : ""); }} aria-describedby="evidence-help" />
        <p id="evidence-help" className="text-xs text-ink-soft mt-2">Up to 3 JPG, PNG, WebP, MP4 or WebM files; 6 MB combined. Files stay in SYLP&apos;s private review inbox, with their reference sent alongside the report. They are not published. Photos and videos can contain identifying or location details.</p>
        {fileError && <p role="alert" className="text-sm mt-2">{fileError}</p>}
      </div>}
      <label className="flex items-start gap-3 rounded-xl border border-ink/20 p-4 text-sm cursor-pointer">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 h-5 w-5 shrink-0 accent-[#d94e4e]" />
        <span>{kind === "register" ? "I explicitly agree to SYLP using my registration and involvement details to handle this request. This does not sign me up for marketing." : kind === "incident" ? "I agree to this report being sent to SYLP's incident review service. A checked report may lead to a public reviewer-written summary; my original report and contact details are not published." : "I agree to SYLP using these details to review and respond to this request."} Read <Link href="/community/privacy" className="underline">how community submissions are handled</Link>.</span>
      </label>
      {state.status === "error" && <p role="alert" className="rounded-xl border border-rose bg-blush p-4">{state.message}</p>}
      <button disabled={pending || Boolean(fileError)} type="submit" className="w-full min-h-12 rounded-full bg-rose text-cream px-6 py-3 font-semibold hover:bg-[#ed6666] disabled:opacity-60">{pending ? "Sending…" : kind === "incident" ? "Send incident report" : kind === "whistleblower" ? "Send information privately" : page.action}</button>
      <p className="text-xs text-ink-soft">No account is needed. Submissions are not automatically added to the mailing list.</p>
    </form>
  );
}
