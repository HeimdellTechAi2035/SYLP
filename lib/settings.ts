import { prisma } from "@/lib/prisma";

/** Site-wide settings are a singleton row (id 1), managed from /admin/settings. */
export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return (
    settings ?? {
      id: 1,
      businessName: "Support Your Local Patriot",
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
      orderNotificationEmail: null,
      orderNotificationEmailEnabled: false,
      updatedAt: new Date(),
    }
  );
}

export async function getHomepageContent() {
  const content = await prisma.homepageContent.findUnique({ where: { id: 1 } });
  return (
    content ?? {
      id: 1,
      announcementBarText: "New drop just landed · UK delivery available",
      heroTitle: "Support Your Local Patriot — wear your colours",
      heroSubtitle:
        "Hoodies, tees and everyday gear, printed and packed to order in the UK.",
      heroImage: null,
      heroCtaPrimaryLabel: "Shop Hoodies",
      heroCtaPrimaryHref: "/collections/hoodies",
      heroCtaSecondaryLabel: "Shop All",
      heroCtaSecondaryHref: "/shop",
      storyTitle: "Support Your Local Patriot",
      storyBody:
        "Every item is printed, packed and checked with care before it comes to you.",
      storyImage: null,
      giftSectionTitle: "The perfect gift, ready to give",
      giftSectionBody:
        "Giftable sets for birthdays, thank-yous and every occasion in between.",
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
