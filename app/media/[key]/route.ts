import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readMedia } from "@/lib/storage/media";

// Public - product/category/homepage images uploaded from the admin need to
// be visible to every storefront visitor, not just logged-in admins.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const media = await readMedia(key);

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.contentType,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
