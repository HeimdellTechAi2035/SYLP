"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function addAddress(formData: FormData) {
  const session = await getCustomerSession();
  if (!session) return;

  await prisma.address.create({
    data: {
      customerId: session.sub,
      label: String(formData.get("label") || "") || null,
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || "") || null,
      city: String(formData.get("city") || ""),
      county: String(formData.get("county") || "") || null,
      postcode: String(formData.get("postcode") || ""),
      country: String(formData.get("country") || "United Kingdom"),
    },
  });

  revalidatePath("/account/addresses");
}

export async function deleteAddress(formData: FormData) {
  const session = await getCustomerSession();
  if (!session) return;

  const addressId = String(formData.get("addressId") || "");
  await prisma.address.deleteMany({ where: { id: addressId, customerId: session.sub } });
  revalidatePath("/account/addresses");
}
