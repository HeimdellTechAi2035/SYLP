import { prisma } from "@/lib/prisma";
import { requireCommunityOwner } from "@/lib/community/owner";
import { communityPages, COMMUNITY_PREFIX } from "@/lib/community/config";
import { parseCommunityRecord } from "@/lib/community/records";
import { retryIncident, setCommunityStatus } from "@/lib/actions/admin/community";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function Page() {
  await requireCommunityOwner();
  const messages = await prisma.contactMessage.findMany({ where: { category: { startsWith: COMMUNITY_PREFIX } }, orderBy: { createdAt: "desc" }, take: 200 });
  return <div><AdminPageHeader title="Community inbox" /><p className="text-sm text-ink-soft mb-6">Owner access only. The latest 200 submissions appear below. Reports and evidence are private; do not forward confidential material unnecessarily.</p>
    <div className="space-y-5">{messages.map(message => {
      const record = parseCommunityRecord(message.message);
      if (!record) return null;
      const data = record.data;
      return <article key={message.id} className="rounded-2xl bg-blush border border-ink/15 p-5 min-w-0">
        <div className="flex flex-wrap justify-between gap-3 mb-4"><div><h2 className="font-display text-xl">{communityPages[data.kind]?.title ?? "Community submission"}</h2><p className="text-xs text-ink-soft mt-1 break-all">{record.reference} · {message.createdAt.toLocaleString("en-GB")} · {message.status}</p></div></div>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
          <div><dt className="font-semibold">Contact</dt><dd className="break-words">{data.anonymous ? "No contact details supplied" : `${data.name} ${data.email} ${data.phone}`}</dd></div>
          {data.area && <div><dt className="font-semibold">Area</dt><dd>{data.area}</dd></div>}
          {data.interest && <div><dt className="font-semibold">Interest</dt><dd>{data.interest}</dd></div>}
          {data.fulfilment && <div><dt className="font-semibold">Donation arrangements requested</dt><dd>{data.fulfilment}</dd></div>}
          {data.kind === "incident" && <><div><dt className="font-semibold">Incident location</dt><dd>{data.address}, {data.town}, {data.postcode}</dd></div><div><dt className="font-semibold">Incident delivery</dt><dd>{record.delivery} · {data.incidentCategory}{data.occurredOn && ` · ${data.occurredOn}`}</dd></div></>}
        </dl>
        <p className="text-sm whitespace-pre-wrap break-words border-t border-ink/15 pt-4">{data.message}</p>
        {record.files.length > 0 && <div className="mt-4"><h3 className="font-semibold text-sm mb-2">Private evidence downloads</h3><ul className="space-y-2">{record.files.map((file,index) => <li key={file.key}><a href={`/api/admin/community/evidence/${message.id}/${file.key}`} className="inline-flex min-h-11 items-center text-sm underline">File {index+1}: {file.type} ({Math.ceil(file.size / 1024)} KB)</a></li>)}</ul></div>}
        <div className="flex flex-wrap gap-3 mt-5">
          {message.status === "NEW" && <form action={setCommunityStatus.bind(null,message.id,"READ")}><button className="min-h-11 px-4 py-2 rounded-lg border border-ink/25">Mark read</button></form>}
          {message.status !== "RESPONDED" && <form action={setCommunityStatus.bind(null,message.id,"RESPONDED")}><button className="min-h-11 px-4 py-2 rounded-lg border border-ink/25">Mark handled</button></form>}
          {data.email && <a href={`mailto:${data.email}`} className="inline-flex min-h-11 items-center px-4 py-2 rounded-lg bg-rose">Reply by email</a>}
        </div>
        {record.delivery === "UNCONFIRMED" && <form action={retryIncident.bind(null,message.id)} className="mt-4 border border-gold/50 rounded-lg p-4"><p className="text-sm mb-3">Delivery was not confirmed. Check the incident review queue for this reference before resending, to avoid duplicates.</p><button className="min-h-11 px-4 py-2 rounded-lg border border-ink/25">Retry incident delivery</button></form>}
      </article>;
    })}</div>{messages.length === 0 && <p className="text-ink-soft">No community submissions yet.</p>}
  </div>;
}
