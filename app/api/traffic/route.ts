import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { trackablePath } from "@/lib/analytics/traffic-policy";
import { clientIpFrom, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

const eventSchema = z.object({ visitId: z.uuid(), eventId: z.uuid(), path: z.string().refine(trackablePath), consent: z.literal(true) });
const empty = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : request.nextUrl.origin;
  if (!origin || origin !== expected) return new Response(null, { status: 403 });
  if (request.cookies.has(ADMIN_SESSION_COOKIE) || /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") || "")) return empty();
  if (Number(request.headers.get("content-length") || 0) > 2048) return new Response(null, { status: 413 });
  const key = `traffic:${clientIpFrom(request.headers)}`;
  if (isRateLimited(key, 120, 60_000)) return new Response(null, { status: 429 });
  recordFailedAttempt(key, 60_000);
  const raw = await request.text();
  if (raw.length > 2048) return new Response(null, { status: 413 });
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
  const parsed = eventSchema.safeParse(value);
  if (!parsed.success) return new Response(null, { status: 400 });
  const { visitId, eventId, path } = parsed.data;
  try {
    await prisma.$transaction(async tx => {
      await tx.trafficVisit.upsert({ where: { id: visitId }, create: { id: visitId }, update: { lastSeenAt: new Date() } });
      await tx.trafficPageView.create({ data: { id: eventId, visitId, path } });
    });
  } catch (error) {
    if ((error as { code?: string }).code !== "P2002") return new Response(null, { status: 503 });
  }
  return empty();
}
