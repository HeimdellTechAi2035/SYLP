import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: true }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";
export default function CommunityLayout({ children }: { children: React.ReactNode }) { return children; }
