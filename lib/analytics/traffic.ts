import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { londonStartOfDay } from "./traffic-policy";

export async function getVisitorData(detailed: boolean) {
  await requireAdminSession();
  const today = londonStartOfDay();
  const week = new Date(Date.now() - 7 * 86400_000);
  const month = new Date(Date.now() - 30 * 86400_000);
  const [daily, weekly, monthly, pageViews, topPages, first] = await Promise.all([
    prisma.trafficVisit.count({ where: { pageViews: { some: { createdAt: { gte: today } } } } }),
    prisma.trafficVisit.count({ where: { pageViews: { some: { createdAt: { gte: week } } } } }),
    prisma.trafficVisit.count({ where: { pageViews: { some: { createdAt: { gte: month } } } } }),
    prisma.trafficPageView.count({ where: { createdAt: { gte: month } } }),
    detailed ? prisma.trafficPageView.groupBy({ by: ["path"], where: { createdAt: { gte: month } }, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }) : Promise.resolve([]),
    prisma.trafficPageView.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  return { daily, weekly, monthly, pageViews, topPages, first };
}
