import { prisma } from "@/lib/prisma";
import { unitPriceFor } from "@/lib/pricing";

/**
 * The chatbot/search-safe view of a product. Deliberately a hand-picked
 * whitelist, never a raw Prisma row — costPrice, supplierManufacturerDetails,
 * batchReference, Stripe ids and any other internal-only column must never
 * be reachable through this type no matter what gets added to Product later.
 */
export type PublicProductKnowledge = {
  id: string;
  slug: string;
  name: string;
  productType: string;
  category: string | null;
  fragrance: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleActive: boolean;
  currentPrice: number;
  madeToOrder: boolean;
  productionTimeDays: number | null;
  available: boolean;
  materials: string | null;
  ingredientsInfo: string | null;
  allergenInfo: string | null;
  safetyWarnings: string | null;
  recommendedUsage: string | null;
  variants: {
    id: string;
    name: string;
    size: string | null;
    colour: string | null;
    fragrance: string | null;
    price: number;
    available: boolean;
  }[];
};

function toPublicKnowledge(
  product: Awaited<ReturnType<typeof fetchPublishedProducts>>[number]
): PublicProductKnowledge {
  const available = product.stockQuantity > 0 || product.continueSellingOOS || product.madeToOrder;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productType: product.productType,
    category: product.category?.name ?? null,
    fragrance: product.fragrance?.name ?? null,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    saleActive: product.saleActive,
    currentPrice: unitPriceFor(product),
    madeToOrder: product.madeToOrder,
    productionTimeDays: product.productionTimeDays,
    available,
    materials: product.waxType || product.vesselInfo || null,
    ingredientsInfo: product.ingredientsInfo,
    allergenInfo: product.allergenInfo,
    safetyWarnings: product.safetyWarnings,
    recommendedUsage: product.recommendedUsage,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      size: v.size,
      colour: v.colour,
      fragrance: v.fragrance?.name ?? null,
      price: unitPriceFor(product, v),
      available: v.stockQuantity > 0 || product.continueSellingOOS || product.madeToOrder,
    })),
  };
}

function fetchPublishedProducts() {
  // status: "ACTIVE" is the only eligibility gate — DRAFT and ARCHIVED
  // products never reach this query at all, let alone the knowledge layer.
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { category: true, fragrance: true, variants: { include: { fragrance: true } } },
  });
}

/** All customer-visible product knowledge — the same eligibility rule the storefront itself uses. */
export async function getProductKnowledge(): Promise<PublicProductKnowledge[]> {
  const products = await fetchPublishedProducts();
  return products.map(toPublicKnowledge);
}

export async function getProductKnowledgeBySlug(slug: string): Promise<PublicProductKnowledge | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, fragrance: true, variants: { include: { fragrance: true } } },
  });
  if (!product || product.status !== "ACTIVE") return null;
  return toPublicKnowledge(product);
}
