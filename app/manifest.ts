import type { MetadataRoute } from "next";

// Minimal PWA manifest — exists so the admin dashboard is installable enough
// for Web Push (a registered service worker + manifest) on the store owner's phone.
// Icons preserve the full SYLP artwork on a dark square (public/brand/).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Support Your Local Patriot Admin",
    short_name: "SYLP Admin",
    description: "Order management for Support Your Local Patriot",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#fdf6f0",
    theme_color: "#b5495b",
    icons: [
      { src: "/brand/icon-192-2026.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512-2026.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
