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
  divisionSlug?: string;
  smartCollection?: "new" | "best-sellers" | "seasonal";
  q?: string;
  sort?: "price-asc" | "price-desc" | "newest";
}): Promise<ProductCardData[]> {
  const where: Record<string, unknown> = { ...activeFilter };

  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params.divisionSlug) {
    where.division = { slug: params.divisionSlug };
  }
  if (params.smartCollection === "new") where.isNew = true;
  if (params.smartCollection === "best-sellers") where.bestSeller = true;
  if (params.smartCollection === "seasonal") where.seasonal = true;
  if (params.q) {
    // Case-insensitive, and every word must match somewhere (name, description
    // or division), so "preston hoodie" finds "Preston Patriots Hoodie".
    const words = params.q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
    where.AND = words.map((w) => ({
      OR: [
        { name: { contains: w, mode: "insensitive" } },
        { shortDescription: { contains: w, mode: "insensitive" } },
        { division: { name: { contains: w, mode: "insensitive" } } },
        { category: { name: { contains: w, mode: "insensitive" } } },
      ],
    }));
  }

  const orderBy =
    params.sort === "price-asc"
      ? { price: "asc" as const }
      : params.sort === "price-desc"
        ? { price: "desc" as const }
        : params.divisionSlug || params.categorySlug
          ? [{ category: { sortOrder: "asc" as const } }, { name: "asc" as const }]
          : { createdAt: "desc" as const };

  return prisma.product.findMany({ where, select: cardSelect, orderBy });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      division: { select: { name: true, slug: true, image: true } },
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
    // Only categories with something on sale, so menus and the homepage never show empty ones.
    where: { isActive: true, products: { some: { status: "ACTIVE" } } },
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

export async function getDivisions() {
  return prisma.division.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    // Same fallback as categories: the division's own badge/image wins, else
    // the first product photo, so a new division never shows a blank box.
    include: {
      products: {
        where: { status: "ACTIVE", mainImage: { not: null } },
        select: { mainImage: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
}

export async function getDivisionBySlug(slug: string) {
  return prisma.division.findFirst({ where: { slug, isActive: true } });
}

/** Product-type categories that actually have live items in this division. */
export async function getCategoriesForDivision(divisionSlug: string) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      products: { some: { status: "ACTIVE", division: { slug: divisionSlug } } },
    },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });
}

/** Other live products from the same division, for "More from ..." on a product page. */
export async function getMoreFromDivision(divisionSlug: string, excludeSlug: string, limit = 8): Promise<ProductCardData[]> {
  return prisma.product.findMany({
    where: { ...activeFilter, division: { slug: divisionSlug }, slug: { not: excludeSlug } },
    select: cardSelect,
    take: limit,
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
}
