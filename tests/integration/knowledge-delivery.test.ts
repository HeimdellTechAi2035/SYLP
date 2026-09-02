import { describe, it, expect, afterEach } from "vitest";
import { randomUUID } from "crypto";

const { prisma } = await import("@/lib/prisma");
const { getDeliveryKnowledge } = await import("@/lib/knowledge/delivery");

const createdZoneIds: string[] = [];
const createdRateIds: string[] = [];

afterEach(async () => {
  await prisma.deliveryZone.deleteMany({ where: { id: { in: createdZoneIds.splice(0) } } });
  await prisma.postageRate.deleteMany({ where: { id: { in: createdRateIds.splice(0) } } });
});

async function isolatedZone(overrides: Record<string, unknown> = {}) {
  const suffix = randomUUID().slice(0, 8);
  const zone = await prisma.deliveryZone.create({
    data: {
      name: `knowledge-test-zone-${suffix}`,
      countries: `Knowledgeland-${suffix}`,
      price: 295,
      freeThreshold: null,
      isActive: true,
      ...overrides,
    },
  });
  createdZoneIds.push(zone.id);
  return zone;
}

describe("11. delivery price comes from current settings", () => {
  it("reflects the zone's current customer price, and picks up a change immediately", async () => {
    const zone = await isolatedZone({ price: 295 });
    let knowledge = await getDeliveryKnowledge();
    expect(knowledge.find((k) => k.methodName === zone.name)?.customerPrice).toBe(295);

    await prisma.deliveryZone.update({ where: { id: zone.id }, data: { price: 350 } });

    knowledge = await getDeliveryKnowledge();
    expect(knowledge.find((k) => k.methodName === zone.name)?.customerPrice).toBe(350);
  });
});

describe("12. free-delivery threshold comes from current settings", () => {
  it("reflects the zone's current free-delivery threshold, including turning it off", async () => {
    const zone = await isolatedZone({ freeThreshold: 3000 });
    let knowledge = await getDeliveryKnowledge();
    expect(knowledge.find((k) => k.methodName === zone.name)?.freeDeliveryThreshold).toBe(3000);

    await prisma.deliveryZone.update({ where: { id: zone.id }, data: { freeThreshold: null } });

    knowledge = await getDeliveryKnowledge();
    expect(knowledge.find((k) => k.methodName === zone.name)?.freeDeliveryThreshold).toBeNull();
  });
});

describe("13 & 14. internal postage cost and packaging cost are NEVER exposed via delivery knowledge", () => {
  it("a zone with an assigned postage rate never leaks the rate's cost or existence through knowledge", async () => {
    const rate = await prisma.postageRate.create({ data: { name: "Secret Internal Rate", cost: 99999 } });
    createdRateIds.push(rate.id);
    const zone = await isolatedZone({ postageRateId: rate.id });

    const knowledge = await getDeliveryKnowledge();
    const entry = knowledge.find((k) => k.methodName === zone.name);
    expect(entry).toBeDefined();

    const serialized = JSON.stringify(entry);
    expect(serialized).not.toContain("99999");
    expect(serialized).not.toContain("Secret Internal Rate");
    expect(Object.keys(entry as object)).not.toContain("postageRateId");
    expect(Object.keys(entry as object)).not.toContain("estimatedPostageCost");
    expect(Object.keys(entry as object)).not.toContain("packagingCost");
  });
});
