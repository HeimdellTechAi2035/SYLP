"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { productFormSchema } from "@/lib/validation";
import {
  syncProductToStripe,
  syncVariantToStripe,
  archiveProductInStripe,
  deactivateVariantInStripe,
} from "@/lib/stripe-sync";

function readProductForm(formData: FormData) {
  // "Track stock quantity" is the admin-facing control; madeToOrder (its
  // inverse) is what checkout/payment-finalisation actually key off. When
  // stock isn't tracked, the stock fields aren't even rendered — default
  // them rather than requiring the admin to type an artificial number.
  const trackStock = formData.get("trackStock") === "on";

  return productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    status: formData.get("status"),
    productType: formData.get("productType"),
    categoryId: formData.get("categoryId") || "",
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    saleActive: formData.get("saleActive") === "on",
    costPrice: formData.get("costPrice") || undefined,
    stockQuantity: trackStock ? formData.get("stockQuantity") : 0,
    lowStockThreshold: trackStock ? formData.get("lowStockThreshold") : 5,
    continueSellingOOS: trackStock && formData.get("continueSellingOOS") === "on",
    madeToOrder: !trackStock,
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
    material: str("material"),
    careInstructions: str("careInstructions"),
    netWeightGrams: num("netWeightGrams"),
    dimensions: str("dimensions"),
    safetyWarnings: str("safetyWarnings"),
    supplierManufacturerDetails: str("supplierManufacturerDetails"),
    batchReference: str("batchReference"),
    safetyDocumentUrl: str("safetyDocumentUrl"),
    giftPackagingAvailable: formData.get("giftPackagingAvailable") === "on",
    giftMessageEnabled: formData.get("giftMessageEnabled") === "on",
    seoTitle: str("seoTitle"),
    metaDescription: str("metaDescription"),
    packagingProfileId: str("packagingProfileId"),
  };
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();
  const data = readProductForm(formData);

  const product = await prisma.product.create({
    data: {
      ...data,
      categoryId: data.categoryId || null,
      price: Math.round(data.price * 100),
      salePrice: data.salePrice ? Math.round(data.salePrice * 100) : null,
      costPrice: data.costPrice ? Math.round(data.costPrice * 100) : null,
      ...extraFields(formData),
    },
  });

  // Fire-and-await, but never let a Stripe hiccup block the product actually
  // saving — syncProductToStripe catches its own errors and records them.
  await syncProductToStripe(product.id, { priceChanged: true, detailsChanged: true });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminSession();
  const data = readProductForm(formData);

  const before = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, salePrice: true, saleActive: true, name: true, description: true, shortDescription: true, mainImage: true, status: true },
  });

  const newPrice = Math.round(data.price * 100);
  const newSalePrice = data.salePrice ? Math.round(data.salePrice * 100) : null;

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      categoryId: data.categoryId || null,
      price: newPrice,
      salePrice: newSalePrice,
      costPrice: data.costPrice ? Math.round(data.costPrice * 100) : null,
      ...extraFields(formData),
    },
  });

  // Diff against the pre-update row so the sync engine only redoes the work
  // that's actually needed — a new Stripe Price only when the price itself
  // (or sale state) changed, never on every unrelated field edit.
  const priceChanged =
    !before ||
    before.price !== newPrice ||
    before.salePrice !== newSalePrice ||
    before.saleActive !== Boolean(formData.get("saleActive") === "on");
  const detailsChanged =
    !before ||
    before.name !== data.name ||
    before.description !== (data.description || null) ||
    before.shortDescription !== (data.shortDescription || null) ||
    before.mainImage !== (data.mainImage || null);
  const justPublished = before?.status !== "ACTIVE" && data.status === "ACTIVE";

  await syncProductToStripe(productId, { priceChanged: priceChanged || justPublished, detailsChanged });

  if (before?.status === "ACTIVE" && data.status !== "ACTIVE") {
    // No longer sellable (e.g. unpublished back to draft, or archived via this form).
    await archiveProductInStripe(productId);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/", "layout");
}

export async function archiveProduct(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") || "");
  await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
  await archiveProductInStripe(productId);
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

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      name,
      sku,
      size: String(formData.get("variantSize") || "") || null,
      colour: String(formData.get("variantColour") || "") || null,
      priceOverride: formData.get("variantPriceOverride") ? Math.round(Number(formData.get("variantPriceOverride")) * 100) : null,
      stockQuantity: Number(formData.get("variantStock") || 0),
      packagingProfileId: String(formData.get("variantPackagingProfileId") || "") || null,
    },
  });

  if (variant.priceOverride != null) {
    await syncVariantToStripe(variant.id, { forceReprice: true });
  }

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function removeVariant(formData: FormData) {
  await requireAdminSession();
  const variantId = String(formData.get("variantId") || "");
  const productId = String(formData.get("productId") || "");
  await deactivateVariantInStripe(variantId);
  await prisma.productVariant.delete({ where: { id: variantId } }).catch(() => {});
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function retryStripeSync(productId: string) {
  await requireAdminSession();
  // Force a full reconciliation (product + all price-overriding variants),
  // exactly what "Retry Stripe Sync" should mean — idempotent either way.
  await syncProductToStripe(productId, { priceChanged: true, detailsChanged: true });
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
}
