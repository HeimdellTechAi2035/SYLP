import type { MetadataRoute } from "next";

// Minimal PWA manifest — exists so the admin dashboard is installable enough
// for Web Push (a registered service worker + manifest) on the store owner's phone.
// Reuses the existing brand logo rather than fabricating dedicated icon
// sizes that don't exist yet; replace with proper 192/512 PNGs when available.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Support Your Local Patriot Admin",
    short_name: "HbM Admin",
    description: "Order management for Support Your Local Patriot",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#fdf6f0",
    theme_color: "#b5495b",
    icons: [
      { src: "/brand/logo.jpg", sizes: "192x192", type: "image/jpeg" },
      { src: "/brand/logo.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  };
}
