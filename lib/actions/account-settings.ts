"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export type SettingsState = { status: "idle" | "success" | "error"; message?: string };

export async function updateAccountSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await getCustomerSession();
  if (!session) return { status: "error", message: "You must be signed in." };

  const firstName = String(formData.get("firstName") || "");
  const lastName = String(formData.get("lastName") || "");
  const phone = String(formData.get("phone") || "");
  const newPassword = String(formData.get("newPassword") || "");

  const data: { firstName: string; lastName: string; phone: string | null; passwordHash?: string } = {
    firstName,
    lastName,
    phone: phone || null,
  };

  if (newPassword) {
    if (newPassword.length < 8) {
      return { status: "error", message: "New password must be at least 8 characters." };
    }
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await prisma.customer.update({ where: { id: session.sub }, data });
  revalidatePath("/account/settings");

  return { status: "success", message: "Your details have been updated." };
}
