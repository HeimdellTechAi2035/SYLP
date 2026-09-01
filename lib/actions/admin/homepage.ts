"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function updateHomepageContent(formData: FormData) {
  await requireAdminSession();
  const str = (key: string) => String(formData.get(key) || "") || null;

  await prisma.homepageContent.upsert({
    where: { id: 1 },
    update: {
      announcementBarText: str("announcementBarText"),
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      heroImage: str("heroImage"),
      heroCtaPrimaryLabel: str("heroCtaPrimaryLabel"),
      heroCtaPrimaryHref: str("heroCtaPrimaryHref"),
      heroCtaSecondaryLabel: str("heroCtaSecondaryLabel"),
      heroCtaSecondaryHref: str("heroCtaSecondaryHref"),
      storyTitle: str("storyTitle"),
      storyBody: str("storyBody"),
      storyImage: str("storyImage"),
      giftSectionTitle: str("giftSectionTitle"),
      giftSectionBody: str("giftSectionBody"),
      giftSectionImage: str("giftSectionImage"),
    },
    create: {
      id: 1,
      announcementBarText: str("announcementBarText"),
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      heroImage: str("heroImage"),
      heroCtaPrimaryLabel: str("heroCtaPrimaryLabel"),
      heroCtaPrimaryHref: str("heroCtaPrimaryHref"),
      heroCtaSecondaryLabel: str("heroCtaSecondaryLabel"),
      heroCtaSecondaryHref: str("heroCtaSecondaryHref"),
      storyTitle: str("storyTitle"),
      storyBody: str("storyBody"),
      storyImage: str("storyImage"),
      giftSectionTitle: str("giftSectionTitle"),
      giftSectionBody: str("giftSectionBody"),
      giftSectionImage: str("giftSectionImage"),
    },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function addHomepageFeature(formData: FormData) {
  await requireAdminSession();
  await prisma.homepageFeature.create({
    data: {
      section: "WHY_SHOP",
      icon: String(formData.get("icon") || "") || null,
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || "") || null,
    },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function removeHomepageFeature(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  await prisma.homepageFeature.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}
