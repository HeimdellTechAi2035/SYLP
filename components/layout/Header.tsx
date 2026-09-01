import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHomepageContent } from "@/lib/settings";
import { getCartToken, getCartWithItems } from "@/lib/cart";
import MobileMenu from "@/components/layout/MobileMenu";

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

  const navLinks = [
    { label: "Shop", href: "/shop" },
    ...categoryLinks,
    { label: "New", href: "/collections/new" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80 border-b border-ink/10">
      {homepage.announcementBarText && (
        <div className="bg-rose-dark text-cream text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide">
          {homepage.announcementBarText}
        </div>
      )}

      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenu links={navLinks} />
        </div>

        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="HandMade by Mia — home">
          <Image
            src="/brand/logo.jpg"
            alt="HandMade by Mia"
            width={44}
            height={44}
            className="rounded-full object-cover"
            priority
          />
          <span className="hidden sm:block font-display text-lg text-ink leading-tight">
            HandMade <span className="text-rose-dark">by Mia</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft hover:text-rose-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <form action="/shop" className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-ink-soft" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Search fragrances..."
              aria-label="Search products"
              className="pl-9 pr-3 py-2 rounded-full bg-white/70 border border-ink/10 text-sm w-48 focus:w-64 transition-all outline-none"
            />
          </form>
          <Link
            href="/account"
            aria-label="Your account"
            className="p-2 rounded-full hover:bg-white/70 transition-colors"
          >
            <User className="h-5 w-5 text-ink" />
          </Link>
          <Link
            href="/cart"
            aria-label={`Basket, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative p-2 rounded-full hover:bg-white/70 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-ink" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-dark text-cream text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
