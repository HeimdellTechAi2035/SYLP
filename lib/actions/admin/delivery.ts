"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function deliveryZoneData(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    countries: String(formData.get("countries") || ""),
    price: Math.round(Number(formData.get("price") || 0) * 100),
    freeThreshold: formData.get("freeThreshold") ? Math.round(Number(formData.get("freeThreshold")) * 100) : null,
    estimatedDays: String(formData.get("estimatedDays") || "") || null,
    isActive: formData.get("isActive") === "on",
    postageRateId: String(formData.get("postageRateId") || "") || null,
  };
}

export async function createDeliveryZone(formData: FormData) {
  await requireAdminSession();
  await prisma.deliveryZone.create({ data: deliveryZoneData(formData) });
  revalidatePath("/admin/delivery");
}

export async function updateDeliveryZone(zoneId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.deliveryZone.update({ where: { id: zoneId }, data: deliveryZoneData(formData) });
  revalidatePath("/admin/delivery");
}

export async function deleteDeliveryZone(formData: FormData) {
  await requireAdminSession();
  const zoneId = String(formData.get("zoneId") || "");
  await prisma.deliveryZone.delete({ where: { id: zoneId } }).catch(() => {});
  revalidatePath("/admin/delivery");
}

function packagingProfileData(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || "") || null,
    cost: Math.round(Number(formData.get("cost") || 0) * 100),
    isActive: formData.get("isActive") === "on",
  };
}

export async function createPackagingProfile(formData: FormData) {
  await requireAdminSession();
  await prisma.packagingProfile.create({ data: packagingProfileData(formData) });
  revalidatePath("/admin/delivery");
}

export async function updatePackagingProfile(profileId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.packagingProfile.update({ where: { id: profileId }, data: packagingProfileData(formData) });
  revalidatePath("/admin/delivery");
}

export async function deletePackagingProfile(formData: FormData) {
  await requireAdminSession();
  const profileId = String(formData.get("profileId") || "");
  // Products/variants pointing at this profile just fall back to "no
  // packaging profile assigned" (onDelete: SetNull) — never blocked by FK.
  await prisma.packagingProfile.delete({ where: { id: profileId } }).catch(() => {});
  revalidatePath("/admin/delivery");
}

function postageRateData(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    cost: Math.round(Number(formData.get("cost") || 0) * 100),
    minWeightGrams: formData.get("minWeightGrams") ? Number(formData.get("minWeightGrams")) : null,
    maxWeightGrams: formData.get("maxWeightGrams") ? Number(formData.get("maxWeightGrams")) : null,
    isActive: formData.get("isActive") === "on",
  };
}

export async function createPostageRate(formData: FormData) {
  await requireAdminSession();
  await prisma.postageRate.create({ data: postageRateData(formData) });
  revalidatePath("/admin/delivery");
}

export async function updatePostageRate(rateId: string, formData: FormData) {
  await requireAdminSession();
  await prisma.postageRate.update({ where: { id: rateId }, data: postageRateData(formData) });
  revalidatePath("/admin/delivery");
}

export async function deletePostageRate(formData: FormData) {
  await requireAdminSession();
  const rateId = String(formData.get("rateId") || "");
  await prisma.postageRate.delete({ where: { id: rateId } }).catch(() => {});
  revalidatePath("/admin/delivery");
}
