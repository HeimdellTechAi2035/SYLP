import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminGiftSetsPage() {
  const giftSets = await prisma.product.findMany({
    where: { productType: "GIFT_SET" },
    orderBy: { updatedAt: "desc" },
    include: { giftSetItems: { include: { component: { select: { name: true } } } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Gift Sets"
        action={
          <Link href="/admin/products/new" className="px-5 py-2.5 rounded-full bg-rose-dark text-cream font-semibold text-sm">
            + Add Gift Set
          </Link>
        }
      />
      <p className="text-sm text-ink-soft mb-6">
        Create a gift set by adding a product with type &ldquo;Gift Set&rdquo;, then add its component products from the product edit page.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {giftSets.map((set) => (
          <Link key={set.id} href={`/admin/products/${set.id}/edit`} className="bg-white rounded-xl p-5 hover:shadow-sm">
            <h3 className="font-semibold mb-1">{set.name}</h3>
            <p className="text-sm text-ink-soft mb-2">{formatPence(set.price)}</p>
            <ul className="text-xs text-ink-soft space-y-0.5">
              {set.giftSetItems.map((item) => (
                <li key={item.id}>{item.quantity} x {item.component.name}</li>
              ))}
              {set.giftSetItems.length === 0 && <li>No components added yet</li>}
            </ul>
          </Link>
        ))}
        {giftSets.length === 0 && <p className="text-ink-soft text-sm">No gift sets yet.</p>}
      </div>
    </div>
  );
}
