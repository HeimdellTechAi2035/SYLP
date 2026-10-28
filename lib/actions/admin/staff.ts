"use server";
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
 const token = randomBytes(32).toString("hex");
 const user = await prisma.$transaction(async tx => {
  const existing = await tx.adminUser.findUnique({ where: { email } });
  if (existing && existing.role !== "STAFF") return null;
  const data = { name, active: false, inviteHash: digest(token), inviteExpiresAt: new Date(Date.now()+48*60*60*1000), sessionVersion: { increment: 1 } };
  const staff = existing ? await tx.adminUser.update({ where: { id: existing.id }, data }) : await tx.adminUser.create({ data: { email, name, role: "STAFF", active: false, passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"),12), inviteHash: digest(token), inviteExpiresAt: data.inviteExpiresAt } });
  await tx.adminPushSubscription.updateMany({ where: { adminUserId: staff.id }, data: { active: false } });
  await tx.auditLog.create({ data: { adminUserId: owner.sub, action: "staff.invite", entityType: "AdminUser", entityId: staff.id } });
  return staff;
 });
 if (!user) return { message: "That email belongs to an owner account." };
 revalidatePath("/admin/staff");
 return { message: "Invitation ready. Share this private link with the staff member. It expires in 48 hours. They choose their own password.", link: `/admin/accept-invite?token=${token}`, success: true };
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
