import Link from "next/link";
import { SUPPORT_URL } from "@/lib/knowledge/community";
import Image from "next/image";
import { Search, ShoppingBag, Coffee, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHomepageContent } from "@/lib/settings";
import { getCartToken, getCartWithItems } from "@/lib/cart";
import MobileMenu from "@/components/layout/MobileMenu";
import BackgroundMusic from "@/components/layout/BackgroundMusic";
import { getBackgroundMusic } from "@/lib/music";
import ShopDropdown from "@/components/layout/ShopDropdown";

export default async function Header() {
  const [categories, divisions, homepage, cartToken, musicUrl] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.division.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    getHomepageContent(),
    getCartToken(),
    getBackgroundMusic(),
  ]);

  const cart = await getCartWithItems(cartToken);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const categoryLinks = categories.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
  }));

  const divisionLinks = divisions.map((d) => ({ label: d.name, href: `/divisions/${d.slug}` }));

  // Top-level links for the mobile drawer — categoryLinks are passed
  // separately and rendered under a collapsible "Shop" section there, same
  // consolidation the desktop nav does via ShopDropdown below.
  const navLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Community", href: "/#community" },
    { label: "Register With Us", href: "/register-with-us" },
    { label: "Report an Incident", href: "/report-an-incident" },
    { label: "Whistleblower Information", href: "/whistleblower-information" },
    { label: "Help the Homeless", href: "/help-the-homeless" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80 border-b border-ink/10">
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate to Support Your Local Patriot on Buy Me a Coffee (opens in a new tab)"
        className="flex min-h-11 items-center justify-center gap-2 bg-[#ffdd00] px-4 py-2 text-center text-sm font-semibold text-[#121010] hover:bg-[#ffe747] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-black"
      >
        <Coffee className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Support our work · Buy us a coffee</span>
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
      {homepage.announcementBarText && (
        <div className="bg-rose-dark text-ink text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide">
          {homepage.announcementBarText}
        </div>
      )}

      <div className="container-page flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenu links={navLinks} categoryLinks={categoryLinks} divisionLinks={divisionLinks} />
        </div>

        <Link href="/" className="flex flex-1 lg:flex-none items-center justify-center lg:justify-start gap-2 min-w-0" aria-label="Support Your Local Patriot — home">
          <Image
            src="/brand/sylp-logo-2026.webp"
            alt="Support Your Local Patriot"
            width={774}
            height={984}
            className="h-12 w-9 sm:h-16 sm:w-13 object-contain shrink-0"
            priority
          />
          {/* Shown on phones too: two short lines there, one line on wider screens. */}
          <span className="font-display text-[13px] sm:text-lg text-ink leading-snug">
            <span className="block sm:inline">Support Your</span>{" "}<span className="block sm:inline">Local Patriot</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
          <ShopDropdown categories={categoryLinks} divisions={divisionLinks} />
          <Link href="/#community" className="text-ink-soft hover:text-rose-dark transition-colors">
            Community
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
          {musicUrl && <BackgroundMusic src={musicUrl} />}
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
            href="/cart"
            aria-label={`Basket, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative min-h-11 min-w-11 flex items-center justify-center p-2 rounded-full hover:bg-blush transition-colors"
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
