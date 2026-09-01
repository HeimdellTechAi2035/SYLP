import Link from "next/link";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { getSiteSettings } from "@/lib/settings";
import NewsletterForm from "@/components/marketing/NewsletterForm";

export default async function Footer() {
  const settings = await getSiteSettings();

  const shopLinks = [
    { label: "Wax Melts", href: "/collections/wax-melts" },
    { label: "Candles", href: "/collections/candles" },
    { label: "Gift Sets", href: "/collections/gift-sets" },
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "Seasonal", href: "/collections/seasonal" },
  ];

  const helpLinks = [
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Your Order", href: "/track-order" },
    { label: "Delivery", href: "/legal/delivery" },
    { label: "Returns & Refunds", href: "/legal/returns-refunds" },
  ];

  const legalLinks = [
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "Candle Safety", href: "/legal/candle-safety" },
    { label: "Wax Melt Safety", href: "/legal/wax-melt-safety" },
    { label: "Accessibility", href: "/legal/accessibility" },
  ];

  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="container-page py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="font-display text-xl">
            HandMade <span className="text-blush">by Mia</span>
          </span>
          <p className="mt-3 text-sm text-cream/70 max-w-xs">
            Small-batch wax melts, candles and gifts, handmade with care.
            {settings.estimatedDispatchDays ? ` UK dispatch in ${settings.estimatedDispatchDays}.` : ""}
          </p>
          <div className="flex gap-3 mt-4">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} aria-label="Instagram" className="p-2 rounded-full bg-cream/10 hover:bg-cream/20">
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} aria-label="Facebook" className="p-2 rounded-full bg-cream/10 hover:bg-cream/20">
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Help" links={helpLinks} />
        <FooterColumn title="Policies" links={legalLinks} />
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page py-8">
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page py-4 text-xs text-cream/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {settings.businessName}. All rights reserved.</span>
          <span>Company registration and VAT details: placeholder — to be added once registered.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-cream mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-cream/70 hover:text-cream transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
