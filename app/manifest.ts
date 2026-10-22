import type { MetadataRoute } from "next";

// Minimal PWA manifest — exists so the admin dashboard is installable enough
// for Web Push (a registered service worker + manifest) on the store owner's phone.
// Icons are the NorthWest Patriots crest, cut to a circle (public/brand/).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NorthWest Patriots Admin",
    short_name: "NWP Admin",
    description: "Order management for NorthWest Patriots",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#fdf6f0",
    theme_color: "#b5495b",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
