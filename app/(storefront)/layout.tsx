import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/marketing/CookieConsent";
import Analytics from "@/components/marketing/Analytics";
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
    default: "HandMade by Mia | Handmade Wax Melts & Candles",
    template: "%s | HandMade by Mia",
  },
  description:
    "Small-batch, hand-poured wax melts, scented candles and gift sets — handmade in the UK by Mia.",
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
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <Analytics gaMeasurementId={settings.gaMeasurementId} metaPixelId={settings.metaPixelId} />
      </body>
    </html>
  );
}
