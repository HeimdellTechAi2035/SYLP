import Link from "next/link";
import { getVisitorData } from "@/lib/analytics/traffic";

export default async function VisitorSummary({ detailed = false }: { detailed?: boolean }) {
  const { daily, weekly, monthly, pageViews, topPages, first } = await getVisitorData(detailed);
  return <section className="mb-8" aria-labelledby="visitor-heading">
    <div className="flex flex-wrap justify-between gap-2 mb-3"><h2 id="visitor-heading" className="font-semibold">Website visitors</h2>{!detailed && <Link href="/admin/analytics" className="text-sm underline">View traffic details</Link>}</div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[["Visits today (UK time)", daily], ["Visits · last 7 days", weekly], ["Visits · last 30 days", monthly], ["Page views · last 30 days", pageViews]].map(([label,value]) => <div key={label} className="bg-blush rounded-xl p-4"><p className="text-xs text-ink-soft">{label}</p><p className="font-display text-2xl mt-1">{Number(value).toLocaleString("en-GB")}</p></div>)}</div>
    <p className="text-xs text-ink-soft mt-3">Visits estimate browser sessions, not individual people; a new visit starts after 30 minutes without a tracked page load. Counts include analytics-consenting visitors only. Admin browsers, known bots and private forms are excluded. {first ? `Recording since ${first.createdAt.toLocaleDateString("en-GB", { timeZone: "Europe/London" })}.` : "Counting starts with the first consenting visitor; earlier traffic is unavailable."} Refresh this page for the latest figures.</p>
    {detailed && <div className="mt-5"><h3 className="font-semibold mb-2">Most viewed pages · last 30 days</h3><div className="bg-blush rounded-xl divide-y divide-ink/10">{topPages.map(page => <div key={page.path} className="flex justify-between gap-3 p-3 text-sm"><span className="break-all">{page.path}</span><span>{page._count._all.toLocaleString("en-GB")}</span></div>)}{topPages.length === 0 && <p className="p-4 text-sm">No page views recorded yet.</p>}</div></div>}
  </section>;
}
