import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <AdminPageHeader title="Customers" />
      <div className="bg-blush rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft border-b border-ink/10">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="p-4">
                  <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-rose-dark">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="p-4 text-ink-soft">{c.email}</td>
                <td className="p-4">{c._count.orders}</td>
                <td className="p-4 text-ink-soft">{c.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-soft">No registered customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
