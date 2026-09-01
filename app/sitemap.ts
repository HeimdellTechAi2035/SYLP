import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [products, categories, policies] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.policy.findMany({ select: { slug: true, lastUpdated: true } }),
  ]);

  const staticRoutes = ["", "/shop", "/about", "/faq", "/contact", "/track-order"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const smartCollections = ["new", "best-sellers", "seasonal"].map((slug) => ({
    url: `${siteUrl}/collections/${slug}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...smartCollections,
    ...categories.map((c) => ({ url: `${siteUrl}/collections/${c.slug}`, lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: `${siteUrl}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...policies.map((p) => ({ url: `${siteUrl}/legal/${p.slug}`, lastModified: p.lastUpdated })),
  ];
}
