import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
export async function requireCommunityOwner() {
  const session = await requireAdminSession();
  if (session.role !== "OWNER" || session.mustChangePassword) notFound();
  return session;
}
