"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

export type AdminLoginState = { status: "idle" | "error"; message?: string };

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export async function loginAdmin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { status: "error", message: "Please enter your email and password." };
  }

  const ip = await getClientIp();
  const rateLimitKey = `admin-login:${ip}:${email}`;
  if (isRateLimited(rateLimitKey, 5, RATE_LIMIT_WINDOW_MS)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    recordFailedAttempt(rateLimitKey, RATE_LIMIT_WINDOW_MS);
    return { status: "error", message: "Incorrect email or password." };
  }

  await createAdminSession({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role });
  redirect("/admin");
}
