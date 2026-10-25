import DeleteRecordForm from "@/components/admin/DeleteRecordForm";
import { deleteSubscriber } from "@/lib/actions/admin/cleanup";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCommunityOwner } from "@/lib/community/owner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireCommunityOwner();
  const query = await searchParams;
  const total = await prisma.newsletterSubscriber.count();
  const pages = Math.max(1, Math.ceil(total / 50));
  const requested = Number(query.page);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: [{ subscribedAt: "desc" }, { id: "desc" }], skip: (page - 1) * 50, take: 50 });
  return <div><AdminPageHeader title="Newsletter Sign-ups" /><p className="text-sm text-ink-soft mb-6">People who joined the mailing list. {total} subscribers · page {page} of {pages}.</p>
    <div className="space-y-3">{subscribers.map(subscriber => <article key={subscriber.id} className="rounded-xl bg-blush p-4"><p className="font-medium break-all">{subscriber.email}</p><p className="text-sm text-ink-soft mt-1">{subscriber.subscribedAt.toLocaleString("en-GB")} · {subscriber.source ?? "Website"}</p><div className="mt-3"><DeleteRecordForm action={deleteSubscriber.bind(null, subscriber.id)} description="Remove this email address from the newsletter list?" /></div></article>)}</div>
    {total === 0 && <p>No newsletter sign-ups yet.</p>}
    <nav aria-label="Newsletter pages" className="flex gap-4 mt-6">{page > 1 && <Link href={`/admin/newsletter?page=${page - 1}`} className="min-h-11 inline-flex items-center underline">Previous page</Link>}{page < pages && <Link href={`/admin/newsletter?page=${page + 1}`} className="min-h-11 inline-flex items-center underline">Next page</Link>}</nav>
  </div>;
}
