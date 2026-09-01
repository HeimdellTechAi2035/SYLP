import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true },
  });
  if (!customer) notFound();

  return (
    <div>
      <AdminPageHeader title={`${customer.firstName} ${customer.lastName}`} />
      <p className="text-ink-soft mb-8">{customer.email}{customer.phone && ` · ${customer.phone}`}</p>

      <h2 className="font-semibold mb-3">Orders</h2>
      <div className="bg-white rounded-xl overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/5 last:border-0">
                <td className="p-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-rose-dark">{order.orderNumber}</Link>
                </td>
                <td className="p-4 text-ink-soft">{order.createdAt.toLocaleDateString("en-GB")}</td>
                <td className="p-4">{order.fulfilmentStatus}</td>
                <td className="p-4">{formatPence(order.total)}</td>
              </tr>
            ))}
            {customer.orders.length === 0 && <tr><td className="p-4 text-ink-soft">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold mb-3">Addresses</h2>
      <div className="space-y-2">
        {customer.addresses.map((a) => (
          <div key={a.id} className="bg-white rounded-lg p-4 text-sm text-ink-soft">
            {a.line1}{a.line2 && `, ${a.line2}`}, {a.city} {a.postcode}, {a.country}
          </div>
        ))}
        {customer.addresses.length === 0 && <p className="text-ink-soft text-sm">No saved addresses.</p>}
      </div>
    </div>
  );
}
