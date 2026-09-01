"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { productFormSchema } from "@/lib/validation";

function readProductForm(formData: FormData) {
  return productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    status: formData.get("status"),
    productType: formData.get("productType"),
    categoryId: formData.get("categoryId") || "",
    fragranceId: formData.get("fragranceId") || "",
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    saleActive: formData.get("saleActive") === "on",
    costPrice: formData.get("costPrice") || undefined,
    stockQuantity: formData.get("stockQuantity"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    continueSellingOOS: formData.get("continueSellingOOS") === "on",
    madeToOrder: formData.get("madeToOrder") === "on",
    productionTimeDays: formData.get("productionTimeDays") || undefined,
    mainImage: formData.get("mainImage") || "",
    featured: formData.get("featured") === "on",
    bestSeller: formData.get("bestSeller") === "on",
    isNew: formData.get("isNew") === "on",
    seasonal: formData.get("seasonal") === "on",
    giftable: formData.get("giftable") === "on",
  });
}

function extraFields(formData: FormData) {
  const num = (key: string) => {
    const v = formData.get(key);
    return v ? Number(v) : null;
  };
  const str = (key: string) => {
    const v = formData.get(key);
    return v ? String(v) : null;
  };

  return {
    waxType: str("waxType"),
    wickType: str("wickType"),
    vesselInfo: str("vesselInfo"),
    netWeightGrams: num("netWeightGrams"),
    dimensions: str("dimensions"),
    meltFormat: str("meltFormat"),
    piecesCount: num("piecesCount"),
    recommendedUsage: str("recommendedUsage"),
    storageGuidance: str("storageGuidance"),
    candleWeightGrams: num("candleWeightGrams"),
    vesselSize: str("vesselSize"),
    burnInstructions: str("burnInstructions"),
    candleCare: str("candleCare"),
    burnTimeHours: num("burnTimeHours"),
    firstBurnInstructions: str("firstBurnInstructions"),
    wickTrimmingGuidance: str("wickTrimmingGuidance"),
    maxBurnSessionHours: num("maxBurnSessionHours"),
    safetyWarnings: str("safetyWarnings"),
    allergenInfo: str("allergenInfo"),
    clpInfo: str("clpInfo"),
    supplierManufacturerDetails: str("supplierManufacturerDetails"),
    batchReference: str("batchReference"),
    ingredientsInfo: str("ingredientsInfo"),
    safetyDocumentUrl: str("safetyDocumentUrl"),
    giftPackagingAvailable: formData.get("giftPackagingAvailable") === "on",
    giftMessageEnabled: formData.get("giftMessageEnabled") === "on",
    seoTitle: str("seoTitle"),
    metaDescription: str("metaDescription"),
  };
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();
  const data = readProductForm(formData);

  const product = await prisma.product.create({
    data: {
      ...data,
      categoryId: data.categoryId || null,
      fragranceId: data.fragranceId || null,
      price: Math.round(data.price * 100),
      salePrice: data.salePrice ? Math.round(data.salePrice * 100) : null,
      costPrice: data.costPrice ? Math.round(data.costPrice * 100) : null,
      ...extraFields(formData),
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminSession();
  const data = readProductForm(formData);

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      categoryId: data.categoryId || null,
      fragranceId: data.fragranceId || null,
      price: Math.round(data.price * 100),
      salePrice: data.salePrice ? Math.round(data.salePrice * 100) : null,
      costPrice: data.costPrice ? Math.round(data.costPrice * 100) : null,
      ...extraFields(formData),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/", "layout");
}

export async function archiveProduct(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") || "");
  await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/products");
}

export async function addProductImage(productId: string, formData: FormData) {
  await requireAdminSession();
  const url = String(formData.get("url") || "");
  const altText = String(formData.get("altText") || "");
  if (!url) return;
  await prisma.productImage.create({ data: { productId, url, altText: altText || null } });
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function removeProductImage(formData: FormData) {
  await requireAdminSession();
  const imageId = String(formData.get("imageId") || "");
  const productId = String(formData.get("productId") || "");
  await prisma.productImage.delete({ where: { id: imageId } }).catch(() => {});
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function addVariant(productId: string, formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("variantName") || "");
  const sku = String(formData.get("variantSku") || "");
  if (!name || !sku) return;

  await prisma.productVariant.create({
    data: {
      productId,
      name,
      sku,
      fragranceId: String(formData.get("variantFragranceId") || "") || null,
      size: String(formData.get("variantSize") || "") || null,
      colour: String(formData.get("variantColour") || "") || null,
      priceOverride: formData.get("variantPriceOverride") ? Math.round(Number(formData.get("variantPriceOverride")) * 100) : null,
      stockQuantity: Number(formData.get("variantStock") || 0),
    },
  });
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function removeVariant(formData: FormData) {
  await requireAdminSession();
  const variantId = String(formData.get("variantId") || "");
  const productId = String(formData.get("productId") || "");
  await prisma.productVariant.delete({ where: { id: variantId } }).catch(() => {});
  revalidatePath(`/admin/products/${productId}/edit`);
}
