import { requireAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

// Every admin page reads the session cookie and every mutation runs as a
// Server Action — none of it may ever be cached or statically optimized.
// See next.config.ts's matching Cache-Control override for why this is
// belt-and-braces: that one guards the CDN, this one guards Next's own
// render/action pipeline.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  return <AdminShell session={session}>{children}</AdminShell>;
}
