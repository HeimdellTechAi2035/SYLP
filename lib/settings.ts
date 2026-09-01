import { prisma } from "@/lib/prisma";

/** Site-wide settings are a singleton row (id 1), managed from /admin/settings. */
export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return (
    settings ?? {
      id: 1,
      businessName: "HandMade by Mia",
      supportEmail: null,
      supportPhone: null,
      freeDeliveryThreshold: null,
      standardDeliveryPrice: 295,
      estimatedDispatchDays: "1-3 working days",
      estimatedDeliveryDays: "2-4 working days",
      instagramUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
      gaMeasurementId: null,
      metaPixelId: null,
      maintenanceMode: false,
      updatedAt: new Date(),
    }
  );
}

export async function getHomepageContent() {
  const content = await prisma.homepageContent.findUnique({ where: { id: 1 } });
  return (
    content ?? {
      id: 1,
      announcementBarText: "Handmade with care · UK delivery available",
      heroTitle: "Beautiful home fragrance, handmade by Mia",
      heroSubtitle:
        "Small-batch wax melts and candles, poured and packed by hand in the UK. [Placeholder copy — replace with confirmed brand messaging.]",
      heroImage: null,
      heroCtaPrimaryLabel: "Shop Wax Melts",
      heroCtaPrimaryHref: "/collections/wax-melts",
      heroCtaSecondaryLabel: "Shop Candles",
      heroCtaSecondaryHref: "/collections/candles",
      storyTitle: "Handmade by Mia",
      storyBody:
        "[Placeholder] Every wax melt and candle is hand-poured in small batches, checked, and packed with care before it comes to you.",
      storyImage: null,
      giftSectionTitle: "The perfect gift, ready to give",
      giftSectionBody:
        "[Placeholder] Giftable sets for birthdays, thank-yous and every occasion in between.",
      giftSectionImage: null,
      updatedAt: new Date(),
    }
  );
}

export async function getActiveDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getHomepageFeatures(section: string) {
  return prisma.homepageFeature.findMany({
    where: { section },
    orderBy: { sortOrder: "asc" },
  });
}
