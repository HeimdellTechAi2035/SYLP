"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function updateSiteSettings(formData: FormData) {
  await requireAdminSession();
  const str = (key: string) => String(formData.get(key) || "") || null;

  const data = {
    businessName: String(formData.get("businessName") || "HandMade by Mia"),
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
  const session = await requireAdminSession();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (newPassword.length < 8) {
    return { status: "error", message: "New password must be at least 8 characters." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash } });

  return { status: "success", message: "Password updated." };
}
