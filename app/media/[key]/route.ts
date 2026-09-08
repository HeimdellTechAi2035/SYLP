import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mediaStore } from "@/lib/storage/media";

// Public — product/category/homepage images uploaded from the admin need to
// be visible to every storefront visitor, not just logged-in admins.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const store = mediaStore();
  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType =
    typeof result.metadata?.contentType === "string" ? result.metadata.contentType : "application/octet-stream";

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
