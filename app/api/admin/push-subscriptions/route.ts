import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Deliberately NOT using requireAdminSession() here — that redirects on
// failure, which is wrong for a fetch()-based JSON API (the browser would
// just follow the redirect and see the login page's HTML as a "200 OK").
// A browser PushSubscription is only ever meaningful tied to whoever is
// currently authenticated as an admin; there is no customer-facing use of
// this endpoint at all.

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  const label = typeof body?.label === "string" ? body.label.slice(0, 100) : null;

  if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
  }

  const subscription = await prisma.adminPushSubscription.upsert({
    where: { endpoint },
    update: { adminUserId: session.sub, p256dh, auth, active: true, label },
    create: { adminUserId: session.sub, endpoint, p256dh, auth, label },
  });

  return NextResponse.json({ id: subscription.id });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Deactivate rather than delete — keeps its OrderNotification history intact.
  await prisma.adminPushSubscription.updateMany({
    where: { endpoint },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
