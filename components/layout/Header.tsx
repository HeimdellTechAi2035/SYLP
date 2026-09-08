import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHomepageContent } from "@/lib/settings";
import { getCartToken, getCartWithItems } from "@/lib/cart";
import MobileMenu from "@/components/layout/MobileMenu";
import ShopDropdown from "@/components/layout/ShopDropdown";

export default async function Header() {
  const [categories, homepage, cartToken] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    getHomepageContent(),
    getCartToken(),
  ]);

  const cart = await getCartWithItems(cartToken);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const categoryLinks = categories.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
  }));

  // Top-level links for the mobile drawer — categoryLinks are passed
  // separately and rendered under a collapsible "Shop" section there, same
  // consolidation the desktop nav does via ShopDropdown below.
  const navLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "New", href: "/collections/new" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80 border-b border-ink/10">
      {homepage.announcementBarText && (
        <div className="bg-rose-dark text-ink text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide">
          {homepage.announcementBarText}
        </div>
      )}

      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenu links={navLinks} categoryLinks={categoryLinks} />
        </div>

        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Support Your Local Patriot — home">
          <Image
            src="/brand/logo.jpg"
            alt="Support Your Local Patriot"
            width={44}
            height={44}
            className="rounded-full object-cover"
            priority
          />
          <span className="hidden sm:block font-display text-lg text-ink leading-tight">
            Support Your Local Patriot
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
          <ShopDropdown categories={categoryLinks} />
          <Link href="/collections/new" className="text-ink-soft hover:text-rose-dark transition-colors">
            New
          </Link>
          <Link href="/about" className="text-ink-soft hover:text-rose-dark transition-colors">
            About
          </Link>
          <Link href="/faq" className="text-ink-soft hover:text-rose-dark transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="text-ink-soft hover:text-rose-dark transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <form action="/shop" className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-ink-soft" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              aria-label="Search products"
              className="pl-9 pr-3 py-2 rounded-full bg-blush border border-ink/20 text-ink placeholder:text-ink/50 text-sm w-48 focus:w-64 transition-all outline-none"
            />
          </form>
          <Link
            href="/account"
            aria-label="Your account"
            className="p-2 rounded-full hover:bg-blush transition-colors"
          >
            <User className="h-5 w-5 text-ink" />
          </Link>
          <Link
            href="/cart"
            aria-label={`Basket, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative p-2 rounded-full hover:bg-blush transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-ink" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-dark text-ink text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-semibold border border-ink">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
