import { prisma } from "@/lib/prisma";

export function validMusicUrl(value: string) {
  if (!value) return true;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || !/^\/[A-Za-z0-9/_-]+\.(mp3|ogg|wav|m4a)$/i.test(value)) return false;
  return true;
}
export async function getBackgroundMusic() {
  const row = await prisma.homepageFeature.findFirst({ where: { section: "BACKGROUND_MUSIC" }, orderBy: { sortOrder: "asc" } });
  return row?.body && validMusicUrl(row.body) ? row.body : "";
}
