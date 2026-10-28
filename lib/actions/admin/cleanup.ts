"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/auth";
import { requireCommunityOwner } from "@/lib/community/owner";
import { COMMUNITY_PREFIX } from "@/lib/community/config";
import { parseCommunityRecord } from "@/lib/community/records";
import { removeEvidence } from "@/lib/community/evidence";

async function admin() {
  const session = await requireOwnerSession();
  if (session.mustChangePassword) throw new Error("Change your password first");
  return session;
}
function refreshInboxes() {
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/community", "layout");
}
export async function deleteMessage(id: string) {
  const session = await admin();
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return;
  const community = message.category.startsWith(COMMUNITY_PREFIX);
  if (community) await requireCommunityOwner();
  const record = community ? parseCommunityRecord(message.message) : null;
  if (record?.delivery === "PENDING") throw new Error("Wait for incident delivery to finish");
  const removed = await prisma.$transaction(async tx => {
    const result = await tx.contactMessage.deleteMany({ where: { id, message: message.message, category: message.category } });
    if (result.count) { await tx.supportEntry.deleteMany({ where: { entityType: "ContactMessage", entityId: id } }); await tx.supportTask.deleteMany({ where: { entityType: "ContactMessage", entityId: id } }); }
    if (result.count) await tx.auditLog.create({ data: { adminUserId: session.sub, action: "message.delete", entityType: "ContactMessage", entityId: id } });
    return result.count;
  });
  if (removed && record) await removeEvidence(record.files);
  refreshInboxes();
}
export async function clearHandledMessages() {
  const session = await admin();
  await prisma.$transaction(async tx => {
    const handled = await tx.contactMessage.findMany({ where: { status: "RESPONDED", NOT: { category: { startsWith: COMMUNITY_PREFIX } } }, select: { id: true } });
    await tx.supportEntry.deleteMany({ where: { entityType: "ContactMessage", entityId: { in: handled.map(m => m.id) } } });
    await tx.supportTask.deleteMany({ where: { entityType: "ContactMessage", entityId: { in: handled.map(m => m.id) } } });
    const result = await tx.contactMessage.deleteMany({ where: { id: { in: handled.map(m => m.id) }, status: "RESPONDED", NOT: { category: { startsWith: COMMUNITY_PREFIX } } } });
    await tx.auditLog.create({ data: { adminUserId: session.sub, action: "message.clearHandled", entityType: "ContactMessage", detail: `${result.count} handled contact messages deleted` } });
  });
  refreshInboxes();
}
export async function deleteSubscriber(id: string) {
  const session = await requireCommunityOwner();
  await prisma.$transaction(async tx => {
    await tx.newsletterSubscriber.deleteMany({ where: { id } });
    await tx.auditLog.create({ data: { adminUserId: session.sub, action: "newsletter.delete", entityType: "NewsletterSubscriber", entityId: id } });
  });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
}
export async function deleteReview(id: string) {
  const session = await admin();
  const review = await prisma.review.findUnique({ where: { id }, include: { product: { select: { slug: true } } } });
  if (!review) return;
  await prisma.$transaction(async tx => {
    await tx.review.deleteMany({ where: { id } });
    await tx.auditLog.create({ data: { adminUserId: session.sub, action: "review.delete", entityType: "Review", entityId: id } });
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath(`/products/${review.product.slug}`);
  revalidatePath("/", "layout");
}
