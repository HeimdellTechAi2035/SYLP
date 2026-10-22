import Link from "next/link";
import { Phone, Mail, Download, Search, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import { getBuyers } from "@/lib/queries/buyers";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const tab = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-rose-dark text-ink" : "bg-blush text-ink-soft hover:text-ink"}`;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; division?: string; view?: string }>;
}) {
  const { q, division, view } = await searchParams;
  const divisions = await prisma.division.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } });

  if (view === "accounts") return <AccountsView />;

  const buyers = await getBuyers({ q, division });
  const revenue = buyers.reduce((s, b) => s + b.totalSpent, 0);
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, division, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <AdminPageHeader
        title="Buyers"
        action={
          <a
            href={`/api/admin/buyers/export${qs({})}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-dark text-ink font-semibold text-sm"
          >
            <Download className="h-4 w-4" aria-hidden /> Download
          </a>
        }
      />
      <p className="text-sm text-ink-soft -mt-3 mb-5">
        Everyone who has paid for an order, guest or account. {buyers.length} buyer{buyers.length === 1 ? "" : "s"}
        {buyers.length > 0 && <> · {formatPence(revenue)} spent</>}
      </p>

      <form className="flex gap-2 mb-4" action="/admin/customers">
        {division && <input type="hidden" name="division" value={division} />}
        <label className="relative flex-1">
          <span className="sr-only">Search buyers</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email, phone or postcode"
            className="w-full rounded-full bg-blush pl-9 pr-4 py-2.5 text-sm border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </label>
        <button className="rounded-full bg-blush px-4 text-sm font-medium border border-ink/10">Search</button>
      </form>

      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={`/admin/customers${qs({ division: undefined })}`} className={tab(!division)}>All</Link>
        {divisions.map((d) => (
          <Link key={d.slug} href={`/admin/customers${qs({ division: d.slug })}`} className={tab(division === d.slug)}>
            {d.name.replace(/ Patriots$/, "")}
          </Link>
        ))}
        <Link href="/admin/customers?view=accounts" className={tab(false)}>Accounts</Link>
      </div>

      {buyers.length === 0 ? (
        <p className="bg-blush rounded-xl p-8 text-center text-ink-soft">
          {q || division ? "No buyers match that." : "No paid orders yet — buyers will appear here as soon as someone checks out."}
        </p>
      ) : (
        <ul className="space-y-3">
          {buyers.map((b) => (
            <li key={b.key}>
              <details className="group bg-blush rounded-xl">
                <summary className="list-none cursor-pointer p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {b.orderCount} order{b.orderCount === 1 ? "" : "s"} · {formatPence(b.totalSpent)} · last {b.lastOrderAt.toLocaleDateString("en-GB")}
                    </p>
                    {b.divisions.length > 0 && <p className="text-xs text-rose mt-1">{b.divisions.join(" · ")}</p>}
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-ink-soft group-open:rotate-180 transition-transform" aria-hidden />
                </summary>

                <div className="px-4 pb-4 space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {b.phone && (
                      <a href={`tel:${b.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-2">
                        <Phone className="h-4 w-4 text-rose" aria-hidden /> {b.phone}
                      </a>
                    )}
                    <a href={`mailto:${b.email}`} className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-2 break-all">
                      <Mail className="h-4 w-4 text-rose shrink-0" aria-hidden /> {b.email}
                    </a>
                  </div>
                  <p className="text-ink-soft">
                    {b.address}, <span className="text-ink">{b.postcode}</span>
                  </p>
                  {b.hasAccount && <p className="text-xs text-sage">Has a customer account</p>}
                  <ul className="divide-y divide-ink/10 border-t border-ink/10">
                    {b.orders.map((o) => (
                      <li key={o.id}>
                        <Link href={`/admin/orders/${o.id}`} className="flex items-start justify-between gap-3 py-2.5 hover:text-rose">
                          <span className="min-w-0">
                            <span className="font-medium">{o.orderNumber}</span>
                            <span className="block text-xs text-ink-soft truncate">{o.items}</span>
                          </span>
                          <span className="text-right shrink-0">
                            {formatPence(o.total)}
                            <span className="block text-xs text-ink-soft">{o.createdAt.toLocaleDateString("en-GB")} · {o.status.replace(/_/g, " ").toLowerCase()}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Registered customer accounts (including people who signed up but never bought). */
async function AccountsView() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return (
    <div>
      <AdminPageHeader title="Customer accounts" />
      <Link href="/admin/customers" className="inline-block text-sm text-rose mb-4">&larr; Back to all buyers</Link>
      <ul className="space-y-3">
        {customers.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/customers/${c.id}`} className="block bg-blush rounded-xl p-4 hover:ring-1 hover:ring-rose">
              <p className="font-semibold">{c.firstName} {c.lastName}</p>
              <p className="text-xs text-ink-soft mt-0.5 break-all">{c.email}</p>
              <p className="text-xs text-ink-soft mt-0.5">
                {c._count.orders} order{c._count.orders === 1 ? "" : "s"} · joined {c.createdAt.toLocaleDateString("en-GB")}
              </p>
            </Link>
          </li>
        ))}
        {customers.length === 0 && <li className="bg-blush rounded-xl p-8 text-center text-ink-soft">No registered accounts yet.</li>}
      </ul>
    </div>
  );
}
