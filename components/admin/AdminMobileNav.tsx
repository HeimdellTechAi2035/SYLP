"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { adminNav, adminQuickNav } from "@/components/admin/admin-nav";

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Phone admin navigation: a bottom bar with the everyday pages and a "More"
 * button that opens every admin page. Hidden on laptops (sidebar instead).
 */
export default function AdminMobileNav() {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so it closes itself on navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const quick = adminQuickNav.map((href) => adminNav.find((n) => n.href === href)!);
  const moreActive = !quick.some((n) => isActive(pathname, n.href));

  return (
    <div className="lg:hidden">
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpenOn(null)} aria-hidden />
      )}
      {open && (
        <nav
          id="admin-more-menu"
          aria-label="All admin pages"
          className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-blush border-t border-ink/15 p-3"
        >
          <ul className="grid grid-cols-2 gap-2">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpenOn(null)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive(pathname, item.href) ? "bg-rose-dark text-ink" : "bg-ink/5 text-ink"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-ink/15 bg-rose-dark text-ink pb-[env(safe-area-inset-bottom)]"
      >
        {quick.map((item) => {
          const active = isActive(pathname, item.href) && !open;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "bg-ink/15" : "text-ink/85"}`}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="admin-more-menu"
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${open || moreActive ? "bg-ink/15" : "text-ink/85"}`}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          More
        </button>
      </nav>
    </div>
  );
}
