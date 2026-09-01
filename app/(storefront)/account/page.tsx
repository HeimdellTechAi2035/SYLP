import type { Metadata } from "next";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-auth";
import { logoutCustomer } from "@/lib/actions/customer-auth";
import { prisma } from "@/lib/prisma";
import LoginRegisterForms from "@/components/account/LoginRegisterForms";

export const metadata: Metadata = { title: "Your Account" };

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-4xl mb-8">Your Account</h1>
        <LoginRegisterForms />
      </div>
    );
  }

  const customer = await prisma.customer.findUnique({ where: { id: session.sub } });
  const recentOrders = await prisma.order.findMany({
    where: { customerId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="container-page py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Welcome back{customer?.firstName ? `, ${customer.firstName}` : ""}</h1>
        <form action={logoutCustomer}>
          <button type="submit" className="text-sm text-ink-soft underline hover:text-rose-dark">Sign out</button>
        </form>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <AccountLink href="/account/orders" title="Order History" body="View your past orders and tracking." />
        <AccountLink href="/account/addresses" title="Addresses" body="Manage your saved delivery addresses." />
        <AccountLink href="/account/settings" title="Account Settings" body="Update your name and password." />
      </div>

      <h2 className="font-semibold mb-3">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-ink-soft text-sm">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {recentOrders.map((order) => (
            <li key={order.id} className="py-3 flex justify-between text-sm">
              <Link href={`/account/orders/${order.id}`} className="hover:text-rose-dark">
                {order.orderNumber} &middot; {order.createdAt.toLocaleDateString("en-GB")}
              </Link>
              <span className="text-ink-soft">{order.fulfilmentStatus}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="block rounded-xl bg-white/70 p-5 border border-ink/5 hover:border-rose-dark/40 transition-colors">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-ink-soft">{body}</p>
    </Link>
  );
}
