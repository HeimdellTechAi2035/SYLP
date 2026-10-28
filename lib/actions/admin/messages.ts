"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function setMessageStatus(messageId: string, status: string) {
  const session = await requireAdminSession();
  if (!["READ", "RESPONDED"].includes(status)) throw new Error("Invalid status");
  const message = await prisma.contactMessage.findUnique({ where: { id: messageId }, select: { category: true } });
  if (message?.category.startsWith("Community: ")) await requireAdminSession();
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  await prisma.auditLog.create({ data: { adminUserId: session.sub, action: "support.status", entityType: "ContactMessage", entityId: messageId, detail: status } });
  revalidatePath("/admin/messages");
}
