import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCommunityOwner } from "@/lib/community/owner";
import { communityPages, COMMUNITY_PREFIX } from "@/lib/community/config";
import { parseCommunityRecord } from "@/lib/community/records";
import { retryIncident, setCommunityStatus } from "@/lib/actions/admin/community";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { communityInboxes, type CommunityInboxKind } from "@/lib/community/inboxes";

export default async function CommunityInbox({ kind, searchParams }: { kind?: CommunityInboxKind; searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireCommunityOwner();
  const query = await searchParams;
  const status = ["NEW", "READ", "RESPONDED"].includes(query.status ?? "") ? query.status : undefined;
  const requestedPage = Number(query.page);
  const pageSize = 50;
  const category = kind ? { equals: `${COMMUNITY_PREFIX}${kind}` } : { startsWith: COMMUNITY_PREFIX };
  const where = { category, ...(status ? { status } : {}) };
  const [total, groups] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.groupBy({ by: ["category", "status"], where: { category: { startsWith: COMMUNITY_PREFIX } }, _count: { _all: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;
  const messages = await prisma.contactMessage.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize });
  const base = kind ? `/admin/community/${kind}` : "/admin/community";
  const pageLink = (next: number) => `${base}?page=${next}${status ? `&status=${status}` : ""}`;
  return <div><AdminPageHeader title={kind ? communityInboxes[kind] : "All community submissions"} /><p className="text-sm text-ink-soft mb-6">Owner access only. Reports and evidence stay private. Select a section to review its submissions.</p>
    <nav aria-label="Form inbox sections" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {Object.entries(communityInboxes).map(([key, label]) => {
        const rows = groups.filter(row => row.category === `${COMMUNITY_PREFIX}${key}`);
        const count = rows.reduce((sum, row) => sum + row._count._all, 0);
        const unread = rows.filter(row => row.status === "NEW").reduce((sum, row) => sum + row._count._all, 0);
        return <Link key={key} href={`/admin/community/${key}`} aria-current={kind === key ? "page" : undefined} className={`rounded-xl border p-4 min-h-20 ${kind === key ? "border-gold bg-gold/10" : "border-ink/20 bg-blush"}`}><span className="block font-semibold text-sm">{label}</span><span className="text-xs text-ink-soft">{count} total · {unread} new</span></Link>;
      })}
    </nav>
    <form method="GET" className="flex flex-wrap items-end gap-3 mb-6"><label className="text-sm">Status<select name="status" defaultValue={status ?? ""} className="block mt-1 rounded-lg border border-ink/20 bg-blush p-3 text-base"><option value="">All statuses</option><option value="NEW">New</option><option value="READ">Read</option><option value="RESPONDED">Handled</option></select></label><button className="min-h-12 border border-ink/25 rounded-lg px-4">Apply filter</button><Link href="/admin/community" className="min-h-12 inline-flex items-center underline">All sections</Link></form>
    <p className="text-sm text-ink-soft mb-4">{total} submissions · page {page} of {pages}</p>
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
    })}</div>{messages.length === 0 && <p className="text-ink-soft">No submissions in this section with the selected status.</p>}
    <nav aria-label="Inbox pages" className="flex gap-4 mt-6">{page > 1 && <Link href={pageLink(page - 1)} className="min-h-11 inline-flex items-center underline">Previous page</Link>}{page < pages && <Link href={pageLink(page + 1)} className="min-h-11 inline-flex items-center underline">Next page</Link>}</nav>
  </div>;
}
