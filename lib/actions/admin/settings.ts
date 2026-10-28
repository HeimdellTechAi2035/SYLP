"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireOwnerSession, createAdminSession } from "@/lib/auth";

export async function updateSiteSettings(formData: FormData) {
  await requireOwnerSession();
  const str = (key: string) => String(formData.get(key) || "") || null;

  const data = {
    businessName: String(formData.get("businessName") || "Support Your Local Patriot"),
    supportEmail: str("supportEmail"),
    supportPhone: str("supportPhone"),
    freeDeliveryThreshold: formData.get("freeDeliveryThreshold") ? Math.round(Number(formData.get("freeDeliveryThreshold")) * 100) : null,
    standardDeliveryPrice: Math.round(Number(formData.get("standardDeliveryPrice") || 0) * 100),
    estimatedDispatchDays: str("estimatedDispatchDays"),
    estimatedDeliveryDays: str("estimatedDeliveryDays"),
    instagramUrl: str("instagramUrl"),
    facebookUrl: str("facebookUrl"),
    tiktokUrl: str("tiktokUrl"),
    gaMeasurementId: str("gaMeasurementId"),
    metaPixelId: str("metaPixelId"),
    maintenanceMode: formData.get("maintenanceMode") === "on",
  };

  await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export type PasswordState = { status: "idle" | "success" | "error"; message?: string };

export async function changeAdminPassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await requireAdminSession(true);
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (newPassword.length < 12 || newPassword.length > 128) {
    return { status: "error", message: "New password must be between 12 and 128 characters." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash, mustChangePassword: false, sessionVersion: { increment: 1 } } });

  // Re-issue the session with mustChangePassword cleared — the JWT is
  // stateless, so without this the middleware would keep redirecting back to
  // this same page until the next login, even though the password is
  // already changed.
  await createAdminSession({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role, mustChangePassword: false, sessionVersion: admin.sessionVersion + 1 });

  return { status: "success", message: "Password updated." };
}
