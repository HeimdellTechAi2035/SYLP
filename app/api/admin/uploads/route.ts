import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/auth";
import { mediaStore, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/storage/media";

// Deliberately NOT using requireAdminSession() — that redirects on failure,
// which is wrong for a fetch()-based API (see the same reasoning in
// app/api/admin/push-subscriptions/route.ts).
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type — use JPG, PNG, WEBP or GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large — max 8MB." }, { status: 400 });
  }

  const key = `${randomUUID()}.${ext}`;
  const store = mediaStore();
  await store.set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });

  return NextResponse.json({ url: `/media/${key}` });
}
