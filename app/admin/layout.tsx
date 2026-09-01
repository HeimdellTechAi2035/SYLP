import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/app/(storefront)/globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Admin | HandMade by Mia", template: "%s | HandMade by Mia Admin" },
  robots: { index: false, follow: false },
};

// A separate root layout for /admin — deliberately without the storefront
// Header/Footer/announcement bar, since this is an internal tool, not a
// customer-facing page. See Next.js "multiple root layouts" pattern.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen bg-cream-dark text-ink">{children}</body>
    </html>
  );
}
