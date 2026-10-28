"use server";
import { emailProviderConfigured, sendEmail } from "@/lib/email/provider";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
export type StaffState = { message: string; link?: string; success?: boolean };
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
export async function inviteStaff(_prev: StaffState, form: FormData): Promise<StaffState> {
 const owner = await requireOwnerSession();
 const email = String(form.get("email") ?? "").trim().toLowerCase();
 const name = String(form.get("name") ?? "").trim();
 if (!z.email().safeParse(email).success || !name || name.length > 100) return { message: "Enter a name and valid email address." };
 const throttleKey = `staff-invite-send:${owner.sub}`;
 if (isRateLimited(throttleKey,20,3600000)) return { message: "Invitation limit reached. Please try again later." };
 recordFailedAttempt(throttleKey,3600000);
 const token = randomBytes(32).toString("hex");
 const user = await prisma.$transaction(async tx => {
  const existing = await tx.adminUser.findUnique({ where: { email } });
  if (existing && existing.role !== "STAFF") return null;
  const data = { name, active: false, inviteEmailStatus: "NOT_SENT", inviteEmailSentAt: null, inviteHash: digest(token), inviteExpiresAt: new Date(Date.now()+48*60*60*1000), sessionVersion: { increment: 1 } };
  const staff = existing ? await tx.adminUser.update({ where: { id: existing.id }, data }) : await tx.adminUser.create({ data: { email, name, role: "STAFF", active: false, passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"),12), inviteHash: digest(token), inviteExpiresAt: data.inviteExpiresAt } });
  await tx.adminPushSubscription.updateMany({ where: { adminUserId: staff.id }, data: { active: false } });
  await tx.auditLog.create({ data: { adminUserId: owner.sub, action: "staff.invite", entityType: "AdminUser", entityId: staff.id } });
  return staff;
 });
 if (!user) return { message: "That email belongs to an owner account." };
 const link = `/admin/accept-invite?token=${token}`;
 if (!emailProviderConfigured()) {
  revalidatePath("/admin/staff");
  return { message: "Account invitation created, but NO EMAIL WAS SENT: business email is not configured. Share the private link below, or configure email and use Resend invitation.", link };
 }
 let status = "SENT";
 let rejectionCode: string | undefined;
 try {
  await sendEmail({ to: email, subject: "Your SYLP staff account invitation", text: `Hi ${name},\n\nYou have been invited to join the Support Your Local Patriot staff team.\n\nChoose your own password and activate your account using this private link:\n${new URL(link,"https://support-your-local-patriot.online").href}\n\nThe link expires in 48 hours and can only be used once. Use the latest invitation if you receive more than one. Do not forward this link.\n\nAfter activation, sign in at https://support-your-local-patriot.online/admin/login\n\nSupport Your Local Patriot`, idempotencyKey: `staff-invite-${digest(token)}` });
 } catch (error) { rejectionCode = error instanceof Error ? /status (\d{3})/.exec(error.message)?.[1] : undefined; status = rejectionCode ? "FAILED" : "UNCONFIRMED"; }
 await prisma.$transaction(async tx => {
  await tx.adminUser.updateMany({ where: { id: user.id, inviteHash: digest(token) }, data: { inviteEmailStatus: status, inviteEmailSentAt: status === "SENT" ? new Date() : null } });
  await tx.auditLog.create({ data: { adminUserId: owner.sub, action: status === "SENT" ? "staff.invite.email_sent" : status === "FAILED" ? "staff.invite.email_failed" : "staff.invite.email_unconfirmed", entityType: "AdminUser", entityId: user.id } });
 });
 revalidatePath("/admin/staff");
 return status === "SENT" ? { message: "Invitation email accepted by the email service. Ask them to check their inbox and spam folder. The private link expires in 48 hours.", link, success: true } : status === "FAILED" ? { message: `Invitation created, but the email service rejected the message (status ${rejectionCode}). No invitation email was accepted. Check email settings or share the private link below.`, link } : { message: "Invitation created, but email delivery could not be confirmed. You can share the private link below. Check the email service before resending to avoid duplicates.", link };
}
export async function resendStaffInvite(id: string, _previous: StaffState, _form: FormData): Promise<StaffState> {
 void _previous; void _form;
 await requireOwnerSession();
 const staff = await prisma.adminUser.findUnique({ where: { id } });
 if (!staff || staff.role !== "STAFF" || staff.active || !staff.inviteHash) return { message: "Only pending staff invitations can be resent." };
 const form = new FormData(); form.set("name",staff.name); form.set("email",staff.email);
 return inviteStaff({ message: "" },form);
}
export async function disableStaff(id: string) {
 const owner = await requireOwnerSession();
 await prisma.$transaction(async tx => {
  const result = await tx.adminUser.updateMany({ where: { id, role: "STAFF" }, data: { active: false, sessionVersion: { increment: 1 }, inviteHash: null, inviteExpiresAt: null } });
  if (result.count) { await tx.adminPushSubscription.updateMany({ where: { adminUserId: id }, data: { active: false } }); await tx.auditLog.create({ data: { adminUserId: owner.sub, action: "staff.disable", entityType: "AdminUser", entityId: id } }); }
 });
 revalidatePath("/admin/staff");
}
export async function acceptStaffInvite(_prev: StaffState, form: FormData): Promise<StaffState> {
 const ip = await getClientIp(); const key = `staff-invite:${ip}`;
 if (isRateLimited(key, 10, 300000)) return { message: "Too many attempts. Try again in a few minutes." };
 recordFailedAttempt(key, 300000);
 const token = String(form.get("token") ?? ""); const password = String(form.get("password") ?? "");
 if (!/^[a-f0-9]{64}$/.test(token) || password.length < 12 || password.length > 128) return { message: "Use the invitation link and a password between 12 and 128 characters." };
 const passwordHash = await bcrypt.hash(password,12);
 const result = await prisma.adminUser.updateMany({ where: { role: "STAFF", inviteHash: digest(token), inviteExpiresAt: { gt: new Date() } }, data: { passwordHash, active: true, mustChangePassword: false, inviteHash: null, inviteExpiresAt: null, sessionVersion: { increment: 1 } } });
 return result.count === 1 ? { message: "Account activated. You can now sign in with your email and password.", success: true } : { message: "This invitation has expired or has already been used. Ask the owner for a new one." };
}
