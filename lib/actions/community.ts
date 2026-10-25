"use server";
import { randomBytes, createHmac, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { communitySchema } from "@/lib/community/schema";
import { COMMUNITY_PREFIX } from "@/lib/community/config";
import { saveEvidence, removeEvidence, type EvidenceFile } from "@/lib/community/evidence";
import { forwardIncident } from "@/lib/community/forward-incident";
import type { CommunityRecord } from "@/lib/community/records";
import { getClientIp, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";

const limiterSalt = randomBytes(32);
export type CommunityState = { status: "idle" | "success" | "error"; message?: string; reference?: string };

export async function submitCommunity(_previous: CommunityState, formData: FormData): Promise<CommunityState> {
  if (formData.get("website")) return { status: "success", message: "Thank you. Your submission has been received." };
  const key = "community:" + createHmac("sha256", limiterSalt).update(await getClientIp()).digest("hex");
  const window = 15 * 60 * 1000;
  if (isRateLimited(key, 5, window)) return { status: "error", message: "Too many submissions. Please wait 15 minutes before trying again." };
  recordFailedAttempt(key, window);
  const fields = ["kind", "name", "email", "phone", "area", "message", "consent", "interest", "fulfilment", "address", "town", "postcode", "incidentCategory", "occurredOn"];
  const parsed = communitySchema.safeParse({ ...Object.fromEntries(fields.map(f => [f, formData.get(f) || ""])), anonymous: formData.get("anonymous") === "yes" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form." };
  const data = parsed.data;
  const uploads = formData.getAll("evidence").filter((file): file is File => file instanceof File && file.size > 0);
  if (uploads.length && data.kind !== "incident") return { status: "error", message: "This form does not accept attachments." };
  let files: EvidenceFile[] = [];
  try { if (uploads.length) files = await saveEvidence(uploads); }
  catch (error) { const message = error instanceof Error && (error.message.startsWith("Choose up to") || error.message.startsWith("Use JPG")) ? error.message : "The files could not be saved. Please try again."; return { status: "error", message }; }
  const id = randomUUID();
  const reference = `SYLP-${randomBytes(6).toString("hex").toUpperCase()}`;
  const record: CommunityRecord = { version: 1, reference, data, files, delivery: data.kind === "incident" ? "PENDING" : "NOT_REQUIRED" };
  try {
    await prisma.contactMessage.create({ data: { id, name: data.name || "No contact details supplied", email: data.email, phone: data.phone || null,
      category: `${COMMUNITY_PREFIX}${data.kind}`, message: JSON.stringify(record) } });
  } catch { await removeEvidence(files); return { status: "error", message: "We couldn't save your submission. Please try again." }; }
  if (data.kind === "incident") {
    try { await forwardIncident(data, reference, files.length); record.delivery = "SENT"; }
    catch { record.delivery = "UNCONFIRMED"; }
    await prisma.contactMessage.update({ where: { id }, data: { message: JSON.stringify(record) } }).catch(() => {});
    return { status: "success", reference, message: record.delivery === "SENT"
      ? "Your incident report has been received by the review service. Evidence files, if supplied, are held privately by SYLP under this reference."
      : "Your report is saved privately with SYLP. Delivery to the incident service could not be confirmed; the team can review and resend it. Please keep your reference." };
  }
  return { status: "success", reference, message: data.kind === "donation"
    ? "Your offer has been received. The team will contact you to agree arrangements. Please wait for confirmation before travelling or leaving items."
    : data.kind === "register" ? "Your registration request has been received. The team will contact you about getting involved."
    : "Your information has been received privately for review. If you left no contact details, we cannot reply. Please keep your reference." };
}
