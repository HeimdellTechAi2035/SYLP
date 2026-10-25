"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCommunityOwner } from "@/lib/community/owner";
import { validMusicUrl } from "@/lib/music";

export async function setBackgroundMusic(formData: FormData) {
  await requireCommunityOwner();
  const url = String(formData.get("musicUrl") ?? "").trim();
  if (!validMusicUrl(url)) throw new Error("Use a local audio path, for example /audio/background.mp3, or leave blank to disable music.");
  await prisma.$transaction(async tx => {
    await tx.homepageFeature.deleteMany({ where: { section: "BACKGROUND_MUSIC" } });
    if (url) await tx.homepageFeature.create({ data: { section: "BACKGROUND_MUSIC", title: "Background music", body: url } });
  });
  revalidatePath("/", "layout");
}
