"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function updatePolicy(policyId: string, formData: FormData) {
  await requireAdminSession();
  const policy = await prisma.policy.update({
    where: { id: policyId },
    data: {
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || ""),
      isDraft: formData.get("isDraft") === "on",
    },
  });
  revalidatePath("/admin/policies");
  revalidatePath(`/legal/${policy.slug}`);
}
