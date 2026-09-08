import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/marketing/CookieConsent";
import Analytics from "@/components/marketing/Analytics";
import ChatWidget from "@/components/chat/ChatWidget";
import { getSiteSettings } from "@/lib/settings";
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
    default: "Support Your Local Patriot | Hoodies, Apparel & Gifts",
    template: "%s | Support Your Local Patriot",
  },
  description:
    "Hoodies, t-shirts, keyrings, stickers, cups, pens, phone cases, puzzles, wallets, wristbands and bags — printed and packed in the UK.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
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
