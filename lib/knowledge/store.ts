import { getSiteSettings } from "@/lib/settings";

export type StoreKnowledge = {
  businessName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  estimatedDispatchDays: string | null;
  estimatedDeliveryDays: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
};

/**
 * Explicit whitelist of SiteSettings fields — never the raw row. SiteSettings
 * also holds orderNotificationEmail/orderNotificationEmailEnabled (Mia's
 * private inbox for paid-order alerts) and maintenanceMode, neither of which
 * belongs anywhere near a customer-facing answer.
 */
export async function getStoreKnowledge(): Promise<StoreKnowledge> {
  const s = await getSiteSettings();
  return {
    businessName: s.businessName,
    supportEmail: s.supportEmail,
    supportPhone: s.supportPhone,
    estimatedDispatchDays: s.estimatedDispatchDays,
    estimatedDeliveryDays: s.estimatedDeliveryDays,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    tiktokUrl: s.tiktokUrl,
  };
}
