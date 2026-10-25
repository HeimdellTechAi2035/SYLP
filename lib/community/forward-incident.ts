import { createHash } from "node:crypto";
import type { CommunityData } from "./schema";

const SERVICE = "https://report-hmo-near-you.online";
type Challenge = { salt: string; bits: number; sig: string };

/** Follow the receiving service's normal proof-of-work protocol; never bypass its checks. */
export function solveChallenge(challenge: Challenge) {
  if (typeof challenge.salt !== "string" || challenge.salt.length > 200 || !Number.isInteger(challenge.bits) || challenge.bits < 8 || challenge.bits > 20 || !/^[a-f0-9]{64}$/i.test(challenge.sig)) throw new Error("Invalid challenge");
  for (let nonce = 0; nonce < 5_000_000; nonce++) {
    const hash = createHash("sha256").update(`${challenge.salt}:${nonce}`).digest();
    let zeros = 0;
    for (const byte of hash) { if (byte === 0) { zeros += 8; continue; } zeros += Math.clz32(byte) - 24; break; }
    if (zeros >= challenge.bits) return { ...challenge, nonce };
  }
  throw new Error("Challenge could not be completed");
}

export async function forwardIncident(data: CommunityData, reference: string, attachmentCount: number) {
  const challengeResponse = await fetch(`${SERVICE}/api/challenge`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!challengeResponse.ok) throw new Error("Incident service unavailable");
  const pow = solveChallenge(await challengeResponse.json());
  const description = [`SYLP reference: ${reference}`, attachmentCount ? `${attachmentCount} evidence file(s) held privately in the SYLP community inbox under this reference.` : "", data.message].filter(Boolean).join("\n\n");
  const response = await fetch(`${SERVICE}/api/report/incident`, {
    method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address_line: data.address, town: data.town, postcode: data.postcode.toUpperCase(), category: data.incidentCategory,
      ...(data.occurredOn ? { occurred_on: data.occurredOn } : {}), description,
      ...(data.email ? { contact: data.email } : {}), website: "", pow }),
  });
  if (!response.ok) throw new Error(`Incident delivery not confirmed (${response.status})`);
}
