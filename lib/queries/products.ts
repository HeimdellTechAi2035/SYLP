import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/product/ProductCard";

const cardSelect = {
  slug: true,
  name: true,
  mainImage: true,
  price: true,
  salePrice: true,
  saleActive: true,
  isNew: true,
  bestSeller: true,
  stockQuantity: true,
  continueSellingOOS: true,
  madeToOrder: true,
} as const;

const activeFilter = { status: "ACTIVE" } as const;

export async function getBestSellers(limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, bestSeller: true },
    select: cardSelect,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, isNew: true },
    select: cardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, featured: true },
    select: cardSelect,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSeasonalProducts(limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, seasonal: true },
    select: cardSelect,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getGiftSets(limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, productType: "GIFT_SET" },
    select: cardSelect,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getShopProducts(params: {
  categorySlug?: string;
  smartCollection?: "new" | "best-sellers" | "seasonal";
  q?: string;
  sort?: "price-asc" | "price-desc" | "newest";
}): Promise<ProductCardData[]> {
  const where: Record<string, unknown> = { ...activeFilter };

  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params.smartCollection === "new") where.isNew = true;
  if (params.smartCollection === "best-sellers") where.bestSeller = true;
  if (params.smartCollection === "seasonal") where.seasonal = true;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { shortDescription: { contains: params.q } },
    ];
  }

  const orderBy =
    params.sort === "price-asc"
      ? { price: "asc" as const }
      : params.sort === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  return prisma.product.findMany({ where, select: cardSelect, orderBy });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      giftSetItems: { include: { component: { select: cardSelect } } },
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
      relatedFrom: {
        include: { relatedProduct: { select: cardSelect } },
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    // A category's own `image` (set from Admin -> Categories) always wins
    // when present — this is only a fallback so a freshly-added product's
    // photo shows up on its category tile immediately, with no separate
    // "also set the category image" step required.
    include: {
      products: {
        where: { status: "ACTIVE", mainImage: { not: null } },
        select: { mainImage: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
}
