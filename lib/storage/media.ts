// Admin-uploaded media (product/category/homepage images), stored on local
// disk under MEDIA_DIR (default ./media-data) and served back out through
// app/media/[key]/route.ts. Keys are always `<uuid>.<ext>` — anything else is
// rejected so a request can never escape the media directory.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

const CONTENT_TYPE_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_IMAGE_TYPES).map(([type, ext]) => [ext, type])
);

const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

function mediaDir() {
  return path.resolve(process.env.MEDIA_DIR || "media-data");
}

export function isValidMediaKey(key: string) {
  return KEY_PATTERN.test(key);
}

export async function saveMedia(key: string, data: ArrayBuffer) {
  if (!isValidMediaKey(key)) throw new Error("Invalid media key");
  await mkdir(mediaDir(), { recursive: true });
  await writeFile(path.join(mediaDir(), key), Buffer.from(data));
}

export async function readMedia(key: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (!isValidMediaKey(key)) return null;
  try {
    const data = await readFile(path.join(mediaDir(), key));
    return { data, contentType: CONTENT_TYPE_BY_EXT[key.split(".")[1]] };
  } catch {
    return null;
  }
}
