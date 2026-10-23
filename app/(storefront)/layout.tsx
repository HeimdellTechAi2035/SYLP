import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/marketing/CookieConsent";
import Analytics from "@/components/marketing/Analytics";
import ChatWidget from "@/components/chat/ChatWidget";
import { getSiteSettings } from "@/lib/settings";
import { jsonLd, organizationLd, siteUrl, SITE_NAME } from "@/lib/seo/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "NorthWest Patriots | Hoodies, Apparel & Gifts",
    template: "%s | NorthWest Patriots",
  },
  description:
    "Official merch for the NorthWest Patriots divisions — Preston, Merseyside, Greater Manchester, Blackpool and Southport. Hoodies, t-shirts, tracksuits, mugs, keyrings, phone cases, wallets and gift sets with UK delivery.",
  applicationName: "NorthWest Patriots",
  openGraph: {
    type: "website",
    siteName: "NorthWest Patriots",
    locale: "en_GB",
    images: [{ url: "/brand/icon-512.png", width: 512, height: 512, alt: "NorthWest Patriots crest" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "text/plain": "/llms.txt", "application/json": "/catalog.json" } },
  formatDetection: { telephone: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd([
              organizationLd({
                email: settings.supportEmail,
                phone: settings.supportPhone,
                sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl],
              }),
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${siteUrl()}/#website`,
                name: SITE_NAME,
                url: siteUrl(),
                inLanguage: "en-GB",
                publisher: { "@id": `${siteUrl()}/#organization` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${siteUrl()}/shop?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <Header />
        {/* pb-24: real reserved space (not just scroll-padding, see globals.css)
            so a visitor's own manual scroll to the true bottom of a page — not
            just a programmatic scroll-to-element — still leaves the fixed
            chat launcher / cookie-consent bar with clear space below the
            last piece of real content (e.g. a product page's full-width
            "Add to Basket" button). Not needed on larger screens, which
            already have more headroom relative to the launcher's fixed size. */}
        <main className="flex-1 pb-24 sm:pb-0">{children}</main>
        <Footer />
        <CookieConsent />
        <Analytics gaMeasurementId={settings.gaMeasurementId} metaPixelId={settings.metaPixelId} />
        <ChatWidget />
      </body>
    </html>
  );
}
