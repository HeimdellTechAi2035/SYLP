import type { CommunityData } from "./schema";
import type { EvidenceFile } from "./evidence";
export type CommunityRecord = { version: 1; reference: string; data: CommunityData; files: EvidenceFile[]; delivery: "NOT_REQUIRED" | "PENDING" | "SENT" | "UNCONFIRMED" };
export function parseCommunityRecord(message: string): CommunityRecord | null {
  try { const value = JSON.parse(message); return value?.version === 1 && typeof value.reference === "string" && value.data && Array.isArray(value.files) ? value : null; } catch { return null; }
}
