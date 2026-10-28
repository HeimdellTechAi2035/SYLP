import { readFile } from "node:fs/promises";
import path from "node:path";
export const dynamic = "force-dynamic";
const stages = ["create", "activation", "local", "public", "login", "dashboard", "permissions", "cleanup", "complete"];
// Read-only, sanitised diagnostic result. This route cannot create accounts,
// run checks, issue cookies or return credentials or customer information.
export async function GET() {
 try {
  const value = JSON.parse(await readFile(path.resolve(process.env.MEDIA_DIR || "media-data", "diagnostics/staff-signin.json"), "utf8"));
  const checkedAt = new Date(value.checkedAt);
  if (!Number.isFinite(checkedAt.getTime()) || Date.now() - checkedAt.getTime() > 3600000) return new Response(null, { status: 404 });
  const result = (item: Record<string, unknown> | null) => item && ({
   stage: stages.includes(String(item.stage)) ? item.stage : "unknown",
   loginStatus: Number.isInteger(item.loginStatus) ? item.loginStatus : 0,
   cookieIssued: item.cookieIssued === true, cookieSignatureValid: item.cookieSignatureValid === true,
   versionMatches: item.versionMatches === true, dashboardStatus: Number.isInteger(item.dashboardStatus) ? item.dashboardStatus : 0,
   dashboardVisible: item.dashboardVisible === true, ownerPageBlocked: item.ownerPageBlocked === true,
  });
  return Response.json({ status: value.status === "passed" ? "passed" : "failed", checkedAt: checkedAt.toISOString(), stage: stages.includes(value.stage) ? value.stage : "unknown", activated: value.activated === true, local: result(value.local), public: result(value.public), cleanedUp: value.cleanedUp === true }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
 } catch { return new Response(null, { status: 404 }); }
}
