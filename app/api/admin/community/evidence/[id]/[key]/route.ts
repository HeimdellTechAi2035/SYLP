import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMMUNITY_PREFIX } from "@/lib/community/config";
import { parseCommunityRecord } from "@/lib/community/records";
import { readEvidence } from "@/lib/community/evidence";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; key: string }> }) {
  const session = await getAdminSession();
  if (!session || session.role !== "OWNER" || session.mustChangePassword) return new NextResponse("Not found", { status: 404 });
  const { id, key } = await params;
  const message = await prisma.contactMessage.findFirst({ where: { id, category: { startsWith: COMMUNITY_PREFIX } } });
  const file = message && parseCommunityRecord(message.message)?.files.find(f => f.key === key);
  if (!file) return new NextResponse("Not found", { status: 404 });
  try {
    const bytes = await readEvidence(file);
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": file.type, "Content-Disposition": `attachment; filename="evidence.${file.extension}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
