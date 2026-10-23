import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormCheckbox } from "@/components/admin/FormField";
import ImageDropzone from "@/components/admin/ImageDropzone";
import PendingSubmit from "@/components/admin/PendingSubmit";
import { createDivision, updateDivision, deleteDivision, addMissingProducts } from "@/lib/actions/admin/divisions";
import { getDivisionSales, type SalesPeriod } from "@/lib/queries/division-sales";

const PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
];

const select = "w-full rounded-lg border border-ink/15 bg-cloud px-3 py-2.5 text-sm";

export default async function AdminDivisionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const period = (PERIODS.some((p) => p.key === sp.period) ? sp.period : "30d") as SalesPeriod;

  const [divisions, sales] = await Promise.all([
    prisma.division.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { status: { not: "ARCHIVED" } } } } } },
    }),
    getDivisionSales(period),
  ]);
  const templates = divisions.filter((d) => d._count.products > 0);
  const defaultTemplate = templates[0]?.id ?? "";
  const totals = sales.reduce((t, s) => ({ revenue: t.revenue + s.revenue, items: t.items + s.itemsSold }), { revenue: 0, items: 0 });

  return (
    <div>
      <AdminPageHeader title="Divisions" />
      <Flash sp={sp} />

      {/* Sales, kept separate per division */}
      <section className="bg-blush rounded-xl p-4 sm:p-6 mb-6" aria-labelledby="sales-h">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 id="sales-h" className="font-semibold text-lg">Sales by division</h2>
          <div className="flex gap-1.5 overflow-x-auto">
            {PERIODS.map((p) => (
              <Link
                key={p.key}
                href={`/admin/divisions?period=${p.key}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${p.key === period ? "bg-rose-dark text-ink" : "bg-ink/5 text-ink-soft"}`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-ink/10">
          {sales.map((s) => (
            <li key={s.divisionId ?? "none"} className="py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-ink-soft">
                  {s.itemsSold} item{s.itemsSold === 1 ? "" : "s"} · {s.orders} order{s.orders === 1 ? "" : "s"}
                  {s.lastSaleAt ? ` · last ${s.lastSaleAt.toLocaleDateString("en-GB")}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">{formatPence(s.revenue)}</p>
                {s.divisionId && s.orders > 0 && (
                  <Link href={`/admin/orders?division=${s.divisionId}`} className="text-xs text-rose underline">
                    See orders
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 pt-3 border-t border-ink/10 text-sm flex justify-between">
          <span className="text-ink-soft">Total ({totals.items} items)</span>
          <span className="font-semibold">{formatPence(totals.revenue)}</span>
        </p>
        <p className="text-xs text-ink-soft mt-2">
          Item prices from paid orders, before delivery and discount codes. Fully refunded orders aren&apos;t counted. Each item is
          recorded against its division when it&apos;s bought, so divisions never get mixed up.
        </p>
      </section>

      {/* Add a division */}
      <details className="bg-blush rounded-xl p-4 sm:p-6 mb-6" open={divisions.length === 0 || Boolean(sp.error)}>
        <summary className="cursor-pointer font-semibold text-lg">+ Add a division</summary>
        <form action={createDivision} className="space-y-4 mt-4 max-w-xl">
          <FormField label="Name" name="name" id="new-name" required placeholder="e.g. Wigan Patriots" />
          <ImageDropzone name="image" label="Crest (a PNG with a see-through background looks best)" aspect={1} />
          <FormTextarea label="Description (optional)" name="description" id="new-description" />
          <div>
            <label htmlFor="new-copyFrom" className="block text-sm font-medium mb-1">Products</label>
            <select id="new-copyFrom" name="copyFrom" defaultValue={defaultTemplate} className={select}>
              {templates.map((d) => (
                <option key={d.id} value={d.id}>
                  Copy the full range from {d.name} ({d._count.products})
                </option>
              ))}
              <option value="">Don&apos;t add any products yet</option>
            </select>
            <p className="text-xs text-ink-soft mt-1">
              Same products, prices and sizes, renamed for the new division, with the new crest printed on the hoodie and
              t-shirt photos. Each one is added to Stripe. You can change any of them afterwards in Products.
            </p>
          </div>
          <FormCheckbox label="Put the products on sale straight away" name="productsLive" defaultChecked />
          <FormCheckbox label="Show on the website (homepage box and division page)" name="isActive" defaultChecked />
          <FormField label="Position on the homepage (1 = first)" name="sortOrder" id="new-sortOrder" type="number" defaultValue={String(divisions.length + 1)} />
          <details className="text-sm">
            <summary className="cursor-pointer text-ink-soft">Web address (optional)</summary>
            <div className="mt-2">
              <FormField label="Made from the name if left blank" name="slug" id="new-slug" placeholder="wigan-patriots" />
            </div>
          </details>
          <PendingSubmit pendingText="Adding division and products… (about 20 seconds)">Add division</PendingSubmit>
        </form>
      </details>

      {/* Existing divisions */}
      <h2 className="font-semibold text-lg mb-3">Your divisions</h2>
      <div className="space-y-3">
        {divisions.map((d) => {
          const save = updateDivision.bind(null, d.id);
          const fill = addMissingProducts.bind(null, d.id);
          const others = templates.filter((t) => t.id !== d.id);
          return (
            <details key={d.id} className="bg-blush rounded-xl p-4" open={sp.saved === d.slug || sp.added === d.slug}>
              <summary className="cursor-pointer flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 rounded-lg bg-black overflow-hidden">
                  {d.image ? (
                    <Image src={d.image} alt="" fill sizes="48px" className="object-contain" />
                  ) : (
                    <Shield className="absolute inset-0 m-auto h-6 w-6 text-ink-soft" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium truncate">{d.name}</span>
                  <span className="block text-xs text-ink-soft">
                    {d._count.products} product{d._count.products === 1 ? "" : "s"} · {d.isActive ? "On the website" : "Hidden"}
                  </span>
                </span>
              </summary>

              <div className="mt-3 flex gap-4 text-sm">
                <Link href={`/admin/products?division=${d.slug}`} className="text-rose underline">Edit its products</Link>
                <Link href={`/divisions/${d.slug}`} target="_blank" className="text-ink-soft underline">View on shop</Link>
              </div>

              <form action={save} className="grid sm:grid-cols-2 gap-4 mt-4">
                <input type="hidden" name="divisionId" value={d.id} />
                <FormField label="Name" name="name" id={`div-${d.id}-name`} defaultValue={d.name} required />
                <FormField label="Web address" name="slug" id={`div-${d.id}-slug`} defaultValue={d.slug} required />
                <div className="sm:col-span-2">
                  <FormTextarea label="Description" name="description" id={`div-${d.id}-description`} defaultValue={d.description ?? ""} />
                </div>
                <ImageDropzone name="image" label="Crest (changing it reprints the hoodie and t-shirt photos)" defaultValue={d.image} aspect={1} />
                <div className="space-y-4">
                  <FormField label="Position on the homepage" name="sortOrder" id={`div-${d.id}-sortOrder`} type="number" defaultValue={String(d.sortOrder)} />
                  <FormCheckbox label="Show on the website" name="isActive" defaultChecked={d.isActive} />
                </div>
                <div className="sm:col-span-2">
                  <PendingSubmit pendingText="Saving…">Save</PendingSubmit>
                </div>
              </form>

              {others.length > 0 && (
                <form action={fill} className="mt-5 pt-4 border-t border-ink/10 space-y-2">
                  <label htmlFor={`div-${d.id}-copyFrom`} className="block text-sm font-medium">Add any missing products</label>
                  <select id={`div-${d.id}-copyFrom`} name="copyFrom" className={select} defaultValue={others[0].id}>
                    {others.map((t) => (
                      <option key={t.id} value={t.id}>Copy what&apos;s missing from {t.name}</option>
                    ))}
                  </select>
                  <PendingSubmit
                    pendingText="Adding products…"
                    className="px-5 py-2.5 rounded-full bg-ink/10 text-sm font-medium disabled:opacity-60"
                  >
                    Add missing products
                  </PendingSubmit>
                </form>
              )}

              <details className="mt-5 pt-4 border-t border-ink/10 text-sm">
                <summary className="cursor-pointer text-rose-dark">Delete this division</summary>
                <form action={deleteDivision} className="mt-2 space-y-2">
                  <input type="hidden" name="divisionId" value={d.id} />
                  <p className="text-ink-soft">
                    Takes its products off sale (here and in Stripe) and removes it. A division that has sold anything can only be
                    hidden, so its sales history is kept.
                  </p>
                  <PendingSubmit pendingText="Deleting…" className="px-5 py-2.5 rounded-full bg-rose-dark/20 text-rose-dark text-sm font-medium">
                    Yes, delete {d.name}
                  </PendingSubmit>
                </form>
              </details>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  const n = (v?: string) => Number(v || 0);
  let msg: string | null = null;
  let bad = false;
  if (sp.error) {
    msg = sp.error;
    bad = true;
  } else if (sp.added) {
    msg = `Division added.${sp.made ? ` ${sp.made} products created and sent to Stripe.` : ""} It's on the homepage now.`;
  } else if (sp.filled) {
    msg = n(sp.made) ? `${sp.made} missing products added.` : "Nothing was missing.";
  } else if (sp.saved) {
    msg = `Saved.${sp.reprinted ? " Hoodie and t-shirt photos reprinted with the new crest." : ""}`;
  } else if (sp.deleted) {
    msg = `${sp.deleted} deleted.`;
  }
  if (!msg) return null;
  const warnings = [
    n(sp.stripeFailed) ? `${sp.stripeFailed} couldn't be sent to Stripe. Use Check Stripe on the Products page to retry.` : null,
    n(sp.photoFailed) ? `The crest couldn't be printed on ${sp.photoFailed} photo(s). Upload a crest, then save the division.` : null,
  ].filter(Boolean);
  return (
    <div role="status" className={`rounded-xl p-4 mb-6 text-sm ${bad ? "bg-rose-dark/15 text-ink" : "bg-sage/15 text-ink"}`}>
      <p className="font-medium">{msg}</p>
      {warnings.map((w) => <p key={w} className="mt-1">{w}</p>)}
    </div>
  );
}
