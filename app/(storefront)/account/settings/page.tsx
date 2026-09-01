import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/account/SettingsForm";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account");

  const customer = await prisma.customer.findUnique({ where: { id: session.sub } });
  if (!customer) redirect("/account");

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl mb-8">Account Settings</h1>
      <SettingsForm customer={customer} />
    </div>
  );
}
