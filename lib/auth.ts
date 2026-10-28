import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "hbm_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export type AdminSessionPayload = {
  sub: string; // AdminUser.id
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
  sessionVersion?: number;
};

export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("sylp-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export const getAdminSession = cache(async (): Promise<AdminSessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { audience: "sylp-admin", algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.active || !["OWNER", "STAFF"].includes(admin.role) || (payload.sessionVersion ?? 0) !== admin.sessionVersion) return null;
    return { sub: admin.id, email: admin.email, name: admin.name, role: admin.role, mustChangePassword: admin.mustChangePassword, sessionVersion: admin.sessionVersion };
  } catch {
    return null;
  }
});

/** Call at the top of protected admin server components/actions. Redirects if not logged in. */
export async function requireAdminSession(allowPasswordChange = false): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.mustChangePassword && !allowPasswordChange) redirect("/admin/account");
  return session;
}

export async function requireOwnerSession() {
 const session = await requireAdminSession();
 if (session.role !== "OWNER") notFound();
 return session;
}
