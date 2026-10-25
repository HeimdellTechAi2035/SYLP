import Link from "next/link";
import CommunityForm from "./CommunityForm";
import { communityPages, type CommunityKind } from "@/lib/community/config";

export default function CommunityPage({ kind }: { kind: CommunityKind }) {
  const page = communityPages[kind];
  return <div className="container-page py-10 sm:py-16 max-w-3xl">
    <Link href="/#community" className="inline-flex items-center min-h-11 text-sm text-ink-soft underline">Back to community</Link>
    <p className="text-gold uppercase tracking-widest text-xs font-semibold mt-6 mb-3">SYLP Community</p>
    <h1 className="font-display text-3xl sm:text-5xl mb-5">{page.title}</h1>
    <p className="text-ink-soft leading-relaxed mb-8">{page.intro}</p>
    {(kind === "incident" || kind === "whistleblower") && <p className="mb-6 border-l-4 border-gold bg-blush p-4 text-sm">This is not an emergency service and is not monitored around the clock. If someone is in immediate danger, call 999.</p>}
    <CommunityForm kind={kind} />
  </div>;
}
