import Link from "next/link";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { getSiteSettings } from "@/lib/settings";
import NewsletterForm from "@/components/marketing/NewsletterForm";

export default async function Footer() {
  const settings = await getSiteSettings();

  const shopLinks = [
    { label: "Hoodies", href: "/collections/hoodies" },
    { label: "T-Shirts", href: "/collections/t-shirts" },
    { label: "Gift Sets", href: "/collections/gift-sets" },
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "New In", href: "/collections/new" },
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
    { label: "Cancellation Policy", href: "/legal/cancellation" },
    { label: "Complaints", href: "/legal/complaints" },
    { label: "Product Care Guide", href: "/legal/product-care" },
    { label: "Accessibility", href: "/legal/accessibility" },
  ];

  return (
    <footer className="bg-rose-dark text-ink mt-12">
      <div className="container-page py-8 flex flex-wrap gap-x-16 gap-y-6">
        <div className="w-full sm:w-auto sm:max-w-[220px]">
          <span className="font-display text-lg">
            SYLP <span className="text-ink/70 text-sm font-sans">Support Your Local Patriot</span>
          </span>
          <p className="mt-2 text-sm text-ink/80">
            Hoodies, tees and everyday gear for the community, printed and packed to order.
            {settings.estimatedDispatchDays ? ` UK dispatch in ${settings.estimatedDispatchDays}.` : ""}
          </p>
          <div className="flex gap-2 mt-3">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} aria-label="Instagram" className="p-2 rounded-full bg-ink/10 hover:bg-ink/20">
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} aria-label="Facebook" className="p-2 rounded-full bg-ink/10 hover:bg-ink/20">
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Help" links={helpLinks} />
        <FooterColumn title="Policies" links={legalLinks} />
      </div>

      <div className="border-t border-ink/15">
        <div className="container-page py-4">
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-ink/15">
        <div className="container-page py-3 text-xs text-ink/70 space-y-0.5">
          <p>&copy; {new Date().getFullYear()} {settings.businessName}, operated by Heimdell Tech Ai Ltd. All rights reserved.</p>
          <p>Registered in England &amp; Wales, Company No. 16478408. Preston, PR1 9DJ. ICO Registration: ZC079121.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="min-w-[130px]">
      <h3 className="font-semibold text-sm text-ink mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ink/80 hover:text-ink underline-offset-2 hover:underline transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
