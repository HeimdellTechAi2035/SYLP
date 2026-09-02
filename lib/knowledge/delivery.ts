import { getSiteSettings, getActiveDeliveryZones } from "@/lib/settings";

export type DeliveryKnowledge = {
  methodName: string;
  countries: string;
  customerPrice: number;
  freeDeliveryThreshold: number | null;
  estimatedDays: string | null;
};

/**
 * Customer-facing delivery information only — the same DeliveryZone rows
 * the storefront prices from. Deliberately excludes postageRateId and
 * anything from PostageRate/PackagingProfile: those are internal fulfilment
 * cost, never a customer-facing fact.
 */
export async function getDeliveryKnowledge(): Promise<DeliveryKnowledge[]> {
  const zones = await getActiveDeliveryZones();

  if (zones.length > 0) {
    return zones.map((z) => ({
      methodName: z.name,
      countries: z.countries,
      customerPrice: z.price,
      freeDeliveryThreshold: z.freeThreshold,
      estimatedDays: z.estimatedDays,
    }));
  }

  const settings = await getSiteSettings();
  return [
    {
      methodName: "Standard Delivery",
      countries: "United Kingdom",
      customerPrice: settings.standardDeliveryPrice,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      estimatedDays: settings.estimatedDeliveryDays,
    },
  ];
}
