/**
 * Makes a division's hoodie and t-shirt photos by printing its crest onto
 * blank product photos (public/products/templates). The result is saved
 * like any admin upload and served from /media/<id>.jpg.
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp, { type OverlayOptions } from "sharp";
import { readMedia, saveMedia } from "@/lib/storage/media";

export type ApparelKind = "hoodie" | "t-shirt";

// Where the crest sits on each blank photo (centre point and max size, in pixels).
const PLACEMENT: Record<ApparelKind, { cx: number; cy: number; size: number; overlay?: string }> = {
  hoodie: { cx: 391, cy: 689, size: 330, overlay: "hoodie-strings.png" },
  "t-shirt": { cx: 358, cy: 764, size: 355 },
};

const templatesDir = () => path.resolve(/*turbopackIgnore: true*/ process.cwd(), "public", "products", "templates");

/** Reads a division logo from an upload (/media/...) or a file in /public. */
export async function readLogo(image: string | null | undefined): Promise<Buffer | null> {
  if (!image) return null;
  if (image.startsWith("/media/")) return (await readMedia(image.slice("/media/".length)))?.data ?? null;
  if (!image.startsWith("/") || image.includes("..")) return null;
  const publicDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "public");
  const file = path.resolve(publicDir, "." + image);
  if (!file.startsWith(publicDir + path.sep)) return null;
  return readFile(file).catch(() => null);
}

/** Returns the /media URL of the new photo, or null if the logo can't be read. */
export async function makeApparelPhoto(kind: ApparelKind, logoImage: string | null | undefined): Promise<string | null> {
  const logo = await readLogo(logoImage);
  if (!logo) return null;
  const place = PLACEMENT[kind];

  const crest = await sharp(logo)
    .ensureAlpha()
    .trim({ threshold: 1 }) // ignore empty transparent margins around the crest
    .resize(place.size, place.size, { fit: "inside" })
    .modulate({ brightness: 0.9 }) // printed ink sits a touch darker than the artwork
    .png()
    .toBuffer({ resolveWithObject: true });

  const layers: OverlayOptions[] = [
    {
      input: crest.data,
      left: Math.round(place.cx - crest.info.width / 2),
      top: Math.round(place.cy - crest.info.height / 2),
    },
  ];
  if (place.overlay) layers.push({ input: path.join(templatesDir(), place.overlay), left: 0, top: 0 });

  const out = await sharp(path.join(templatesDir(), `blank-${kind}.jpg`))
    .composite(layers)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const key = `${randomUUID()}.jpg`;
  await saveMedia(key, out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
  return `/media/${key}`;
}
