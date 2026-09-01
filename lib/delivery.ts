import { getSiteSettings, getActiveDeliveryZones } from "@/lib/settings";

/** Recalculated server-side at checkout — never trust a delivery amount submitted by the client. */
export async function calculateDeliveryAmount(chargeableSubtotal: number, country: string): Promise<number> {
  const zones = await getActiveDeliveryZones();
  const zone = zones.find((z) => z.countries.toLowerCase().includes(country.toLowerCase())) ?? zones[0];

  if (zone) {
    if (zone.freeThreshold != null && chargeableSubtotal >= zone.freeThreshold) return 0;
    return zone.price;
  }

  const settings = await getSiteSettings();
  if (settings.freeDeliveryThreshold != null && chargeableSubtotal >= settings.freeDeliveryThreshold) return 0;
  return settings.standardDeliveryPrice;
}
