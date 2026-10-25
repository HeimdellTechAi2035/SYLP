"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { requireCommunityOwner } from "@/lib/community/owner";

export async function setMessageStatus(messageId: string, status: string) {
  await requireAdminSession();
  const message = await prisma.contactMessage.findUnique({ where: { id: messageId }, select: { category: true } });
  if (message?.category.startsWith("Community: ")) await requireCommunityOwner();
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin/messages");
}
