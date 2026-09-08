import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  ClipboardList,
  Users,
  Gift,
  Tag,
  Star,
  RotateCcw,
  Mail,
  FileText,
  Home,
  Truck,
  Settings,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import ServiceWorkerRegister from "@/components/admin/ServiceWorkerRegister";
import type { AdminSessionPayload } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/production", label: "Production", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/gift-sets", label: "Gift Sets", icon: Gift },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/policies", label: "Policies", icon: FileText },
  { href: "/admin/faqs", label: "FAQs & Chatbot", icon: MessageCircle },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

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
          <span className="font-display text-lg">SYLP</span>
          <p className="text-xs text-ink/70 mt-0.5">Support Your Local Patriot — Admin Dashboard</p>
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
          <span className="font-display text-lg">Support Your Local Patriot — Admin</span>
          <LogoutButton />
        </header>
        <main className="p-6 sm:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
