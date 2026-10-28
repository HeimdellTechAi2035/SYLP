"use server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { getSupportRecord } from "@/lib/support-record";
import { sendEmail, emailProviderConfigured } from "@/lib/email/provider";
import { revalidatePath } from "next/cache";
import { isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
export type SupportState = { message: string; success?: boolean };
function refresh() { revalidatePath("/admin", "layout"); }
export async function saveSupportTask(type: string, id: string, _previous: SupportState, form: FormData): Promise<SupportState> {
 const session = await requireAdminSession();
 if (!await getSupportRecord(type,id)) return { message: "Record no longer exists." };
 const assignedTo = String(form.get("assignedTo") ?? "") || null;
 if (assignedTo && !await prisma.adminUser.findFirst({ where: { id: assignedTo, active: true } })) return { message: "Choose an active team member." };
 const date = String(form.get("followUpAt") ?? ""); const followUpAt = date ? new Date(`${date}T09:00:00Z`) : null;
 if (followUpAt && !Number.isFinite(followUpAt.getTime())) return { message: "Choose a valid follow-up date." };
 const note = String(form.get("note") ?? "").trim();
 if (note.length > 10000) return { message: "Keep notes below 10,000 characters." };
 await prisma.$transaction(async tx => {
  await tx.supportTask.upsert({ where: { entityType_entityId: { entityType: type, entityId: id } }, create: { entityType: type, entityId: id, assignedTo, followUpAt }, update: { assignedTo, followUpAt } });
  if (note) await tx.supportEntry.create({ data: { entityType: type, entityId: id, adminUserId: session.sub, authorName: session.name, kind: "NOTE", body: note } });
  await tx.auditLog.create({ data: { adminUserId: session.sub, action: "support.task", entityType: type, entityId: id } });
 });
 refresh(); return { message: "Notes and follow-up saved.", success: true };
}
export async function sendSupportReply(type: string, id: string, _previous: SupportState, form: FormData): Promise<SupportState> {
 const session = await requireAdminSession();
 const record = await getSupportRecord(type,id);
 if (!record?.recipient) return { message: "No reply address was supplied. Anonymous submissions cannot receive email." };
 if (!emailProviderConfigured()) return { message: "Business email is not configured. Your message has not been sent. Ask the owner to configure the email provider." };
 const body = String(form.get("body") ?? "").trim(); const subject = String(form.get("subject") ?? "").trim();
 if (!body || body.length > 10000 || !subject || subject.length > 200 || /[\r\n]/.test(subject)) return { message: "Enter a subject (up to 200 characters) and message (up to 10,000 characters)." };
 const key = `support-mail:${session.sub}`;
 if (isRateLimited(key,20,3600000)) return { message: "Hourly sending limit reached. Please try again later." };
 const attempt = String(form.get("attempt") ?? "");
 if (!/^[a-f0-9-]{36}$/.test(attempt)) return { message: "Refresh this page and try again." };
 const entryId = `reply-${attempt}`;
 // Client retry cannot send the same reply twice. An uncertain provider result
 // is recorded for manual checking rather than automatically resending.
 try { await prisma.supportEntry.create({ data: { id: entryId, entityType: type, entityId: id, adminUserId: session.sub, authorName: session.name, kind: "EMAIL", body, subject, recipient: record.recipient, status: "PENDING" } }); }
 catch { return { message: "This reply has already been submitted. Check its delivery history before sending another." }; }
 recordFailedAttempt(key,3600000);
 try {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { supportEmail: true } });
  await sendEmail({ to: record.recipient, subject, text: body, replyTo: settings?.supportEmail ?? undefined, idempotencyKey: entryId });
 } catch {
  await prisma.supportEntry.update({ where: { id: entryId }, data: { status: "UNCONFIRMED" } });
  refresh(); return { message: "Delivery could not be confirmed. Check the email provider before resending to avoid duplicates." };
 }
 await prisma.$transaction(async tx => {
  await tx.supportEntry.update({ where: { id: entryId }, data: { status: "SENT" } });
  if (type === "ContactMessage") await tx.contactMessage.update({ where: { id }, data: { status: "RESPONDED" } });
  await tx.auditLog.create({ data: { adminUserId: session.sub, action: "support.email", entityType: type, entityId: id } });
 });
 refresh(); return { message: "Email sent and saved in the history.", success: true };
}
