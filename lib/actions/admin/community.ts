"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCommunityOwner } from "@/lib/community/owner";
import { COMMUNITY_PREFIX } from "@/lib/community/config";
import { parseCommunityRecord } from "@/lib/community/records";
import { forwardIncident } from "@/lib/community/forward-incident";

export async function setCommunityStatus(id: string, status: string) {
  await requireCommunityOwner();
  if (!["READ", "RESPONDED"].includes(status)) throw new Error("Invalid status");
  await prisma.contactMessage.updateMany({ where: { id, category: { startsWith: COMMUNITY_PREFIX } }, data: { status } });
  revalidatePath("/admin/community");
}
export async function retryIncident(id: string) {
  await requireCommunityOwner();
  const message = await prisma.contactMessage.findFirst({ where: { id, category: `${COMMUNITY_PREFIX}incident` } });
  const record = message && parseCommunityRecord(message.message);
  if (!message || !record || record.delivery !== "UNCONFIRMED") return;
  const sending = { ...record, delivery: "PENDING" as const };
  const claimed = await prisma.contactMessage.updateMany({ where: { id, message: message.message }, data: { message: JSON.stringify(sending) } });
  if (claimed.count !== 1) return;
  try { await forwardIncident(record.data, record.reference, record.files.length); record.delivery = "SENT"; }
  catch { record.delivery = "UNCONFIRMED"; }
  await prisma.contactMessage.update({ where: { id }, data: { message: JSON.stringify(record) } });
  revalidatePath("/admin/community");
}
