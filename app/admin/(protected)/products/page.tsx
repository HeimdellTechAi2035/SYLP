import { requireOwnerSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Search, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StripeCatalogueSyncPanel from "@/components/admin/StripeCatalogueSyncPanel";
import { archiveProduct } from "@/lib/actions/admin/products";
import { getStripeCatalogueSummary } from "@/lib/actions/admin/stripe-catalogue-sync";

const tab = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-rose-dark text-ink" : "bg-blush text-ink-soft hover:text-ink"}`;

/**
 * Products, organised by division. Tap a division to see just its range,
 * tap a product to change its name, price, description, photos or sizes.
 * Built to be usable on a phone.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string; q?: string; status?: string }>;
}) {
  await requireOwnerSession();
  const { division, q, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (division === "none") where.divisionId = null;
  else if (division) where.division = { slug: division };
  if (status) where.status = status;
  else where.status = { not: "ARCHIVED" };
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }];

  const [products, divisions, stripeSummary] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ division: { sortOrder: "asc" } }, { category: { sortOrder: "asc" } }, { name: "asc" }],
      include: { category: true, division: true, _count: { select: { variants: true } } },
    }),
    prisma.division.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { status: { not: "ARCHIVED" } } } } } },
    }),
    getStripeCatalogueSummary(),
  ]);
  const activeDivision = divisions.find((d) => d.slug === division);

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ division, q, status, ...extra })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <AdminPageHeader
        title={activeDivision ? activeDivision.name : "Products"}
        action={
          <Link
            href={`/admin/products/new${activeDivision ? `?division=${activeDivision.id}` : ""}`}
            className="shrink-0 px-4 py-2.5 rounded-full bg-rose-dark text-ink font-semibold text-sm"
          >
            + Add
          </Link>
        }
      />

      <StripeCatalogueSyncPanel totalSellable={stripeSummary.totalSellable} needsSync={stripeSummary.needsSync} />

      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={`/admin/products${qs({ division: undefined })}`} className={tab(!division)}>All</Link>
        {divisions.map((d) => (
          <Link key={d.slug} href={`/admin/products${qs({ division: d.slug })}`} className={tab(division === d.slug)}>
            {d.name.replace(/ Patriots$/, "")} <span className="opacity-70">{d._count.products}</span>
          </Link>
        ))}
        <Link href={`/admin/products${qs({ division: "none" })}`} className={tab(division === "none")}>No division</Link>
      </div>

      <form className="flex gap-2 mb-4" action="/admin/products">
        {division && <input type="hidden" name="division" value={division} />}
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or SKU"
            className="w-full rounded-full bg-blush pl-9 pr-4 py-2.5 text-sm border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </label>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-full bg-blush px-3 text-sm border border-ink/10"
          aria-label="Status"
        >
          <option value="">Live &amp; drafts</option>
          <option value="ACTIVE">Live only</option>
          <option value="DRAFT">Drafts only</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="rounded-full bg-blush px-4 text-sm font-medium border border-ink/10">Go</button>
      </form>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="bg-blush rounded-xl overflow-hidden flex">
            <Link href={`/admin/products/${p.id}/edit`} className="relative w-24 sm:w-28 shrink-0 bg-black" aria-label={`Edit ${p.name}`}>
              {p.mainImage ? (
                <Image src={p.mainImage} alt="" fill sizes="112px" className="object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center"><Package className="h-6 w-6 text-ink-soft" aria-hidden /></span>
              )}
            </Link>
            <div className="min-w-0 flex-1 p-3 flex flex-col">
              <Link href={`/admin/products/${p.id}/edit`} className="font-semibold leading-tight hover:text-rose">
                {p.name}
              </Link>
              <p className="text-xs text-ink-soft mt-1">
                {[p.category?.name, !division || division === "none" ? p.division?.name : null, p.sku].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{formatPence(p.saleActive && p.salePrice ? p.salePrice : p.price)}</span>
                {p.saleActive && p.salePrice ? <span className="text-xs text-ink-soft line-through">{formatPence(p.price)}</span> : null}
                <StatusBadge status={p.status} />
                {p._count.variants > 0 && <span className="text-xs text-ink-soft">{p._count.variants} sizes/options</span>}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-rose">Edit</Link>
                <Link href={`/products/${p.slug}`} target="_blank" className="text-ink-soft underline">View on shop</Link>
                {p.status !== "ARCHIVED" && (
                  <form action={archiveProduct} className="ml-auto">
                    <input type="hidden" name="productId" value={p.id} />
                    <button type="submit" className="text-ink-soft underline hover:text-rose-dark">Archive</button>
                  </form>
                )}
              </div>
            </div>
          </li>
        ))}
        {products.length === 0 && (
          <li className="bg-blush rounded-xl p-8 text-center text-ink-soft sm:col-span-2 xl:col-span-3">
            No products here yet.{" "}
            <Link href={`/admin/products/new${activeDivision ? `?division=${activeDivision.id}` : ""}`} className="text-rose underline">Add one</Link>
          </li>
        )}
      </ul>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, [string, string]> = {
    ACTIVE: ["bg-sage/20 text-sage", "Live"],
    DRAFT: ["bg-gold/20 text-ink", "Draft"],
    ARCHIVED: ["bg-ink/10 text-ink-soft", "Archived"],
  };
  const [cls, label] = styles[status] ?? ["", status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}
