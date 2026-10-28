import { requireAdminSession } from "@/lib/auth";
export async function requireCommunityAccess() { return requireAdminSession(); }
