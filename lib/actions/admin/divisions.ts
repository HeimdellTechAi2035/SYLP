"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { setupDivisionRange, refreshDivisionApparelPhotos, type RangeResult } from "@/lib/division-setup";
import { archiveProductInStripe, syncProductToStripe } from "@/lib/stripe-sync";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

function readForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim().replace(/\s+/g, " ");
  const slug = slugify(String(formData.get("slug") || "") || name);
  return {
    name,
    slug,
    description: String(formData.get("description") || "").trim() || null,
    image: String(formData.get("image") || "") || null,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0) || 0,
  };
}

function done(params: Record<string, string | number | undefined>): never {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  revalidatePath("/admin/divisions");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect(`/admin/divisions?${q.toString()}`);
}

const summary = (r: RangeResult) => ({
  made: r.created.length,
  stripeFailed: r.stripeFailed.length || undefined,
  photoFailed: r.photoFailed.length || undefined,
});

export async function createDivision(formData: FormData) {
  await requireAdminSession();
  const data = readForm(formData);
  if (!data.name || !data.slug) done({ error: "Give the division a name." });
  if (await prisma.division.findUnique({ where: { slug: data.slug } }))
    done({ error: `There's already a division with the web address /divisions/${data.slug}.` });

  const division = await prisma.division.create({ data });

  const templateId = String(formData.get("copyFrom") || "");
  let result: RangeResult | null = null;
  if (templateId) {
    result = await setupDivisionRange(division.id, templateId, { live: formData.get("productsLive") === "on" });
  }
  done({ added: division.slug, ...(result ? summary(result) : {}) });
}

export async function addMissingProducts(divisionId: string, formData: FormData) {
  await requireAdminSession();
  const templateId = String(formData.get("copyFrom") || "");
  if (!templateId) done({ error: "Pick a division to copy products from." });
  const division = await prisma.division.findUnique({ where: { id: divisionId }, select: { slug: true } });
  if (!division) done({ error: "Division not found." });
  const result = await setupDivisionRange(divisionId, templateId, { live: true });
  done({ filled: division.slug, ...summary(result) });
}

export async function updateDivision(divisionId: string, formData: FormData) {
  await requireAdminSession();
  const data = readForm(formData);
  if (!data.name || !data.slug) done({ error: "A division needs a name." });
  const before = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!before) done({ error: "Division not found." });
  if (data.slug !== before.slug && (await prisma.division.findUnique({ where: { slug: data.slug } })))
    done({ error: `There's already a division with the web address /divisions/${data.slug}.` });

  await prisma.division.update({ where: { id: divisionId }, data });

  // Renamed: carry the new name through to this division's products (and Stripe).
  if (data.name !== before.name) {
    const re = new RegExp(before.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const fix = (s: string | null) => (s == null ? s : s.replace(re, data.name));
    const products = await prisma.product.findMany({ where: { divisionId } });
    for (const p of products) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          name: fix(p.name)!,
          shortDescription: fix(p.shortDescription),
          description: fix(p.description),
          seoTitle: fix(p.seoTitle),
          metaDescription: fix(p.metaDescription),
        },
      });
      if (p.status === "ACTIVE") await syncProductToStripe(p.id, { detailsChanged: true });
    }
  }

  // New crest: reprint it on the hoodie and t-shirt photos.
  let reprinted = 0;
  if (data.image && data.image !== before.image) reprinted = await refreshDivisionApparelPhotos(divisionId);

  done({ saved: data.slug, reprinted: reprinted || undefined });
}

export async function deleteDivision(formData: FormData) {
  await requireAdminSession();
  const divisionId = String(formData.get("divisionId") || "");
  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!division) done({ error: "Division not found." });

  // Never lose sales history: a division that has sold anything can only be hidden.
  const sold = await prisma.orderItem.count({ where: { divisionId } });
  if (sold > 0)
    done({ error: `${division.name} has sales, so it can't be deleted. Untick "Show on the website" to hide it instead.` });

  const products = await prisma.product.findMany({ where: { divisionId }, select: { id: true } });
  for (const p of products) {
    await prisma.product.update({ where: { id: p.id }, data: { status: "ARCHIVED" } });
    await archiveProductInStripe(p.id);
  }
  await prisma.division.delete({ where: { id: divisionId } });
  done({ deleted: division.name });
}
