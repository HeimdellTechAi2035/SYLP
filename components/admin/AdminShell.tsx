import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import ServiceWorkerRegister from "@/components/admin/ServiceWorkerRegister";
import type { AdminSessionPayload } from "@/lib/auth";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { adminNav as nav } from "@/components/admin/admin-nav";


export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSessionPayload;
}) {
  return (
    <div className="flex min-h-screen">
      <ServiceWorkerRegister />
      <aside className="w-64 shrink-0 bg-rose-dark text-ink flex flex-col hidden lg:flex border-r border-ink/15">
        <div className="p-5 border-b border-ink/15">
          <span className="font-display text-lg">NWP</span>
          <p className="text-xs text-ink/70 mt-0.5">NorthWest Patriots — Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-ink/90 hover:bg-ink/10 hover:text-ink transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-ink/15 text-xs text-ink/80">
          <p className="mb-2">Signed in as {session.name}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-rose-dark text-ink border-b border-ink/15">
          <span className="font-display text-lg">NorthWest Patriots — Admin</span>
          <LogoutButton />
        </header>
        <main className="p-4 pb-28 sm:p-8 lg:pb-8 max-w-6xl mx-auto">{children}</main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
