import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { communityInboxes } from "@/lib/community/inboxes";
import { COMMUNITY_PREFIX } from "@/lib/community/config";
import { requireCommunityOwner } from "@/lib/community/owner";

export default async function FormInboxOverview() {
  await requireCommunityOwner();
  const [groups, subscribers, contacts] = await Promise.all([
    prisma.contactMessage.groupBy({ by: ["category", "status"], where: { category: { startsWith: COMMUNITY_PREFIX } }, _count: { _all: true } }),
    prisma.newsletterSubscriber.count(),
    prisma.contactMessage.count({ where: { NOT: { category: { startsWith: COMMUNITY_PREFIX } }, status: "NEW" } }),
  ]);
  return <section className="mb-10" aria-labelledby="form-inboxes"><h2 id="form-inboxes" className="font-display text-xl mb-4">Form submissions</h2><div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
    {Object.entries(communityInboxes).map(([kind, label]) => {
      const rows = groups.filter(row => row.category === `${COMMUNITY_PREFIX}${kind}`);
      const total = rows.reduce((sum, row) => sum + row._count._all, 0);
      const unread = rows.filter(row => row.status === "NEW").reduce((sum, row) => sum + row._count._all, 0);
      return <Link key={kind} href={`/admin/community/${kind}`} className="bg-blush border border-ink/15 rounded-xl p-4"><span className="block font-semibold text-sm">{label}</span><span className="block text-gold mt-2">{unread} new</span><span className="text-xs text-ink-soft">{total} total</span></Link>;
    })}
    <Link href="/admin/messages" className="bg-blush border border-ink/15 rounded-xl p-4"><span className="block font-semibold text-sm">Contact Messages</span><span className="block text-gold mt-2">{contacts} new</span></Link>
    <Link href="/admin/newsletter" className="bg-blush border border-ink/15 rounded-xl p-4"><span className="block font-semibold text-sm">Newsletter Sign-ups</span><span className="block text-gold mt-2">{subscribers} subscribers</span></Link>
  </div></section>;
}
