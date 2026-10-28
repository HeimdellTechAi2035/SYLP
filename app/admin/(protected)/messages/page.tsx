import SupportPanel from "@/components/admin/SupportPanel";
import { requireAdminSession } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { setMessageStatus } from "@/lib/actions/admin/messages";
import { deleteMessage, clearHandledMessages } from "@/lib/actions/admin/cleanup";
import DeleteRecordForm from "@/components/admin/DeleteRecordForm";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; record?: string }> }) {
  const session = await requireAdminSession();
  const query = await searchParams;
  const status = ["NEW", "READ", "RESPONDED"].includes(query.status ?? "") ? query.status : undefined;
  const where = { ...(query.record ? { id: query.record } : {}), NOT: { category: { startsWith: "Community: " } }, ...(status ? { status } : {}) };
  const total = await prisma.contactMessage.count({ where });
  const pages = Math.max(1, Math.ceil(total / 50));
  const requested = Number(query.page);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  const messages = await prisma.contactMessage.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 50, take: 50 });
  const link = (p: number) => `/admin/messages?page=${p}${status ? `&status=${status}` : ""}`;
  return <div>
    <AdminPageHeader title="Contact Messages" />
    <div className="flex flex-wrap gap-4 justify-between items-end mb-5">
      <form className="flex gap-2 items-end"><label className="text-sm">Status<select name="status" defaultValue={status ?? ""} className="block rounded-lg border border-ink/20 p-3 mt-1"><option value="">All</option><option value="NEW">New</option><option value="READ">Read</option><option value="RESPONDED">Handled</option></select></label><button className="min-h-11 border rounded-lg px-4">Filter</button></form>
      {session.role === "OWNER" && <DeleteRecordForm action={clearHandledMessages} label="Clear handled messages" description="Permanently delete ALL contact messages marked Responded, across all pages? New messages and community submissions will be kept. This cannot be undone." />}
    </div>
    <p className="text-sm text-ink-soft mb-4">{total} messages · page {page} of {pages}</p>
    <div className="space-y-3">{messages.map(msg => <article key={msg.id} className="bg-blush rounded-xl p-5 min-w-0">
      <div className="flex flex-wrap justify-between gap-2 mb-2"><div><p className="font-medium break-words">{msg.name} · <span className="text-ink-soft font-normal">{msg.email}</span></p><p className="text-xs text-ink-soft">{msg.category}{msg.orderNumber && ` · Order ${msg.orderNumber}`} · {msg.createdAt.toLocaleString("en-GB")}</p></div><span className="text-xs font-medium">{msg.status}</span></div>
      <p className="text-sm text-ink-soft mb-3 whitespace-pre-line break-words">{msg.message}</p>
      <div className="flex flex-wrap gap-2 items-center">
        {msg.status === "NEW" && <form action={setMessageStatus.bind(null, msg.id, "READ")}><button className="min-h-11 text-sm px-3 rounded-lg bg-ink/10">Mark read</button></form>}
        {msg.status !== "RESPONDED" && <form action={setMessageStatus.bind(null, msg.id, "RESPONDED")}><button className="min-h-11 text-sm px-3 rounded-lg bg-sage">Mark responded</button></form>}

        {session.role === "OWNER" && <DeleteRecordForm action={deleteMessage.bind(null, msg.id)} description="Permanently delete this contact message? This cannot be undone." />}
      </div>
      <SupportPanel entityType="ContactMessage" entityId={msg.id} />
    </article>)}</div>
    {messages.length === 0 && <p className="text-ink-soft">No messages with this status.</p>}
    <nav aria-label="Message pages" className="flex gap-4 mt-6">{page > 1 && <Link href={link(page - 1)} className="min-h-11 inline-flex items-center underline">Previous page</Link>}{page < pages && <Link href={link(page + 1)} className="min-h-11 inline-flex items-center underline">Next page</Link>}</nav>
  </div>;
}
