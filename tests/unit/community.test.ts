import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { communitySchema } from "@/lib/community/schema";
import { evidenceType, readEvidence } from "@/lib/community/evidence";
import { forwardIncident, solveChallenge } from "@/lib/community/forward-incident";
const base = { kind: "register", name: "Test Volunteer", email: "test@example.com", phone: "", area: "Preston", message: "I would like to help with community activities.", anonymous: false, consent: "yes", interest: "Volunteering", fulfilment: "", address: "", town: "", postcode: "", incidentCategory: "", occurredOn: "" };
describe("community submission boundaries", () => {
  it("accepts a registration request without creating a shopper account", () => { expect(communitySchema.safeParse(base).success).toBe(true); });
  it("does not let the anonymous flag bypass registration contact requirements", () => { expect(communitySchema.safeParse({ ...base, anonymous: true, name: "", email: "" }).success).toBe(false); });
  it("discards identifying contact fields for an anonymous whistleblower", () => {
    const data = communitySchema.parse({ ...base, kind: "whistleblower", anonymous: true });
    expect([data.name, data.email, data.phone, data.area, data.interest]).toEqual(["", "", "", "", ""]);
  });
  it("requires acknowledgement before storing information", () => { expect(communitySchema.safeParse({ ...base, consent: "" }).success).toBe(false); });
  it("requires arrangements for a donation offer", () => { expect(communitySchema.safeParse({ ...base, kind: "donation" }).success).toBe(false); expect(communitySchema.safeParse({ ...base, kind: "donation", fulfilment: "collection" }).success).toBe(true); });
  it("rejects incomplete incidents and future dates", () => {
    expect(communitySchema.safeParse({ ...base, kind: "incident" }).success).toBe(false);
    expect(communitySchema.safeParse({ ...base, kind: "incident", address: "Test location", town: "Preston", postcode: "PR1 1AA", incidentCategory: "noise", occurredOn: "2099-01-01" }).success).toBe(false);
  });
  it("does not accept HTML or SVG as photographic evidence", () => { expect(evidenceType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull(); expect(evidenceType(Buffer.from("<html>not an image</html>"))).toBeNull(); });
  it("rejects evidence path traversal before touching the filesystem", async () => { await expect(readEvidence({ key: "../../env.bin", size: 1, type: "image/jpeg", extension: "jpg" })).rejects.toThrow("Invalid evidence key"); });
});
describe("incident service integration", () => {
  const challenge = { salt: "test-challenge", bits: 8, sig: "a".repeat(64) };
  it("fulfils the receiving service's proof of work and rejects excessive work", () => {
    const proof = solveChallenge(challenge);
    expect(createHash("sha256").update(`${proof.salt}:${proof.nonce}`).digest()[0]).toBe(0);
    expect(() => solveChallenge({ ...challenge, bits: 32 })).toThrow("Invalid challenge");
  });
  it("forwards incident fields with the case reference, without impersonating a browser origin", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(challenge))).mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetcher);
    try {
      const data = communitySchema.parse({ ...base, kind: "incident", anonymous: true, address: "Test street", town: "Preston", postcode: "PR1 1AA", incidentCategory: "noise" });
      await forwardIncident(data, "SYLP-TEST", 1);
      const [url, options] = fetcher.mock.calls[1];
      expect(url).toBe("https://report-hmo-near-you.online/api/report/incident");
      const body = JSON.parse(options.body);
      expect(body).toMatchObject({ address_line: "Test street", category: "noise", website: "" });
      expect(body.description).toContain("SYLP-TEST"); expect(body.description).toContain("1 evidence file");
      expect(body.contact).toBeUndefined(); expect(options.headers.Origin).toBeUndefined();
    } finally { vi.unstubAllGlobals(); }
  });
  it("does not claim delivery when the incident service rejects the report", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(challenge))).mockResolvedValueOnce(new Response("{}", { status: 429 })));
    try { await expect(forwardIncident(communitySchema.parse(base), "SYLP-TEST", 0)).rejects.toThrow("not confirmed"); } finally { vi.unstubAllGlobals(); }
  });
});
