// Shared bits for search-engine and AI-agent structured data.

export const SITE_NAME = "Support Your Local Patriot";
export const LEGAL_NAME = "Heimdell Tech Ai Ltd";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/** Turn a site-relative path ("/products/x.jpg") into a full URL; leaves full URLs alone. */
export function absUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function penceToPrice(pence: number): string {
  return (pence / 100).toFixed(2);
}

/** Serialise JSON-LD safely for a <script> tag (no "</script>" breakouts). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationLd(opts: { email?: string | null; phone?: string | null; sameAs?: (string | null | undefined)[] } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: siteUrl(),
    logo: absUrl("/brand/icon-512.png"),
    email: opts.email || undefined,
    telephone: opts.phone || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Preston", addressCountry: "GB" },
    identifier: [
      { "@type": "PropertyValue", propertyID: "Companies House", value: "16478408" },
      { "@type": "PropertyValue", propertyID: "ICO", value: "ZC079121" },
    ],
    areaServed: "GB",
    sameAs: (opts.sameAs ?? []).filter(Boolean),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}
