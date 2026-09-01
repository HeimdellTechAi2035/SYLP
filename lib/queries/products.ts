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
  fragrance: { select: { name: true } },
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

export async function getProductsByScentFamily(family: string, limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, fragrance: { scentFamily: family } },
    select: cardSelect,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getScentFamilies(): Promise<string[]> {
  const fragrances = await prisma.fragrance.findMany({
    where: { isActive: true, scentFamily: { not: null } },
    select: { scentFamily: true },
    distinct: ["scentFamily"],
  });
  return fragrances.map((f) => f.scentFamily!).filter(Boolean);
}

export async function getShopProducts(params: {
  categorySlug?: string;
  smartCollection?: "new" | "best-sellers" | "seasonal";
  scentFamily?: string;
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
  if (params.scentFamily) where.fragrance = { scentFamily: params.scentFamily };
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { shortDescription: { contains: params.q } },
      { fragrance: { name: { contains: params.q } } },
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
      fragrance: true,
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
  });
}
