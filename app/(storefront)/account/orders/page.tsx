import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { formatPence } from "@/lib/money";

export const metadata: Metadata = { title: "Order History" };

export default async function OrderHistoryPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account");

  const orders = await prisma.order.findMany({
    where: { customerId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl mb-8">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-ink-soft">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {orders.map((order) => (
            <li key={order.id} className="py-4 flex items-center justify-between">
              <div>
                <Link href={`/account/orders/${order.id}`} className="font-medium hover:text-rose-dark">
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-ink-soft">{order.createdAt.toLocaleDateString("en-GB")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-soft">{order.fulfilmentStatus}</p>
                <p className="font-semibold">{formatPence(order.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
