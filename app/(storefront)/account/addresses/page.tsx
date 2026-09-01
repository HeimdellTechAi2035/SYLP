import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { addAddress, deleteAddress } from "@/lib/actions/addresses";

export const metadata: Metadata = { title: "Your Addresses" };

export default async function AddressesPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account");

  const addresses = await prisma.address.findMany({ where: { customerId: session.sub } });

  return (
    <div className="container-page py-14 max-w-2xl">
      <h1 className="font-display text-4xl mb-8">Your Addresses</h1>

      <ul className="space-y-3 mb-10">
        {addresses.map((address) => (
          <li key={address.id} className="bg-white/70 rounded-xl p-4 flex justify-between items-start">
            <div className="text-sm text-ink-soft">
              {address.label && <p className="font-semibold text-ink">{address.label}</p>}
              <p>{address.line1}{address.line2 && `, ${address.line2}`}</p>
              <p>{address.city}{address.county && `, ${address.county}`} {address.postcode}</p>
              <p>{address.country}</p>
            </div>
            <form action={deleteAddress}>
              <input type="hidden" name="addressId" value={address.id} />
              <button type="submit" className="text-xs text-rose-dark underline">Remove</button>
            </form>
          </li>
        ))}
        {addresses.length === 0 && <p className="text-ink-soft text-sm">No saved addresses yet.</p>}
      </ul>

      <h2 className="font-semibold mb-3">Add a new address</h2>
      <form action={addAddress} className="space-y-3">
        <input name="label" placeholder="Label (e.g. Home)" className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        <input name="line1" placeholder="Address line 1" required className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        <input name="line2" placeholder="Address line 2 (optional)" className="w-full rounded-lg border border-ink/15 px-3 py-2.5" />
        <div className="grid sm:grid-cols-2 gap-3">
          <input name="city" placeholder="Town / City" required className="rounded-lg border border-ink/15 px-3 py-2.5" />
          <input name="county" placeholder="County (optional)" className="rounded-lg border border-ink/15 px-3 py-2.5" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input name="postcode" placeholder="Postcode" required className="rounded-lg border border-ink/15 px-3 py-2.5" />
          <input name="country" placeholder="Country" defaultValue="United Kingdom" className="rounded-lg border border-ink/15 px-3 py-2.5" />
        </div>
        <button type="submit" className="px-6 py-2.5 rounded-full bg-rose-dark text-cream font-semibold">Save Address</button>
      </form>
    </div>
  );
}
