import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography will eventually be served from cloud storage —
    // add its hostname here once chosen (e.g. Vercel Blob, S3, Supabase Storage).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Every /admin response — page loads AND Server Action replies — is
        // per-session and mutates state. Without this, the CDN can cache and
        // replay a stale response (observed in production: a save's Server
        // Action reply got cached and later replayed to a different admin
        // session as a stale "redirect to login", making saves silently
        // fail for everyone until that cache entry expired).
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
