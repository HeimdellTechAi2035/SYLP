// Admin-uploaded media (product/category/homepage images), persisted via
// Netlify Blobs — works identically under `netlify dev` locally and on the
// deployed site, with no external storage account needed. Served back out
// through app/media/[key]/route.ts.
import { getStore } from "@netlify/blobs";

const STORE_NAME = "site-media";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export function mediaStore() {
  return getStore(STORE_NAME);
}
