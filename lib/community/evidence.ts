import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const MAX_EVIDENCE_BYTES = 6 * 1024 * 1024;
export type EvidenceFile = { key: string; type: string; size: number; extension: string };
const directory = () => path.join(path.resolve(/*turbopackIgnore: true*/ process.env.MEDIA_DIR || "media-data"), "community-private");
const validKey = (key: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.bin$/.test(key);
export function evidenceType(bytes: Buffer): { type: string; extension: string } | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", extension: "jpg" };
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { type: "image/png", extension: "png" };
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { type: "image/webp", extension: "webp" };
  if (bytes.toString("ascii", 4, 8) === "ftyp" && /^(isom|iso2|mp41|mp42|avc1|M4V |MSNV)/.test(bytes.toString("ascii", 8, 12))) return { type: "video/mp4", extension: "mp4" };
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])) && bytes.subarray(0, 4096).includes(Buffer.from("webm"))) return { type: "video/webm", extension: "webm" };
  return null;
}
export async function saveEvidence(files: File[]): Promise<EvidenceFile[]> {
  if (files.length > 3 || files.reduce((sum, f) => sum + f.size, 0) > MAX_EVIDENCE_BYTES) throw new Error("Choose up to 3 files, no more than 6 MB combined.");
  const prepared = await Promise.all(files.map(async file => {
    const bytes = Buffer.from(await file.arrayBuffer());
    const type = evidenceType(bytes);
    if (!type || type.type !== file.type) throw new Error("Use JPG, PNG, WebP, MP4 or WebM files only.");
    return { bytes, file: { key: `${randomUUID()}.bin`, ...type, size: bytes.length } };
  }));
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  const saved: EvidenceFile[] = [];
  try {
    for (const p of prepared) { await writeFile(path.join(directory(), p.file.key), p.bytes, { mode: 0o600, flag: "wx" }); saved.push(p.file); }
    return saved;
  } catch (error) { await removeEvidence(saved); throw error; }
}
export async function removeEvidence(files: EvidenceFile[]) {
  await Promise.all(files.filter(f => validKey(f.key)).map(f => unlink(path.join(directory(), f.key)).catch(() => {})));
}
export async function readEvidence(file: EvidenceFile) {
  if (!validKey(file.key)) throw new Error("Invalid evidence key");
  return readFile(path.join(directory(), file.key));
}
