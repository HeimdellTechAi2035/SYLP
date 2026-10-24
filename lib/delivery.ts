import { getSiteSettings, getActiveDeliveryZones } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

async function findMatchingZone(country: string) {
  const zones = await getActiveDeliveryZones();
  return zones.find((z) => z.countries.toLowerCase().includes(country.toLowerCase())) ?? zones[0] ?? null;
}

/** Recalculated server-side at checkout — never trust a delivery amount submitted by the client. */
export async function calculateDeliveryAmount(chargeableSubtotal: number, country: string): Promise<number> {
  const zone = await findMatchingZone(country);

  if (zone) {
    if (zone.freeThreshold != null && chargeableSubtotal >= zone.freeThreshold) return 0;
    return zone.price;
  }

  const settings = await getSiteSettings();
  if (settings.freeDeliveryThreshold != null && chargeableSubtotal >= settings.freeDeliveryThreshold) return 0;
  return settings.standardDeliveryPrice;
}

export type DeliveryResolution = {
  /** What the customer is actually charged — £0 once free delivery applies. */
  amount: number;
  /** Zone/method name, snapshotted onto the Order for admin/email display. */
  methodName: string | null;
  /**
   * What Support Your Local Patriot expects to pay the carrier for this zone's method —
   * independent of `amount`, and still present even when `amount` is 0
   * (free delivery is a pricing decision, not free fulfilment).
   */
  estimatedPostageCost: number;
};

/** Same zone-matching as calculateDeliveryAmount, plus the internal-cost fields checkout needs to snapshot onto the Order. */
export async function resolveDeliveryDetails(chargeableSubtotal: number, country: string): Promise<DeliveryResolution> {
  const zone = await findMatchingZone(country);

  if (zone) {
    const amount = zone.freeThreshold != null && chargeableSubtotal >= zone.freeThreshold ? 0 : zone.price;
    const postageRate = zone.postageRateId
      ? await prisma.postageRate.findUnique({ where: { id: zone.postageRateId } })
      : null;
    return { amount, methodName: zone.name, estimatedPostageCost: postageRate?.cost ?? 0 };
  }

  const settings = await getSiteSettings();
  const amount =
    settings.freeDeliveryThreshold != null && chargeableSubtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.standardDeliveryPrice;
  return { amount, methodName: null, estimatedPostageCost: 0 };
}
