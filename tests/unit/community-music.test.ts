import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
import { validMusicUrl } from "@/lib/music";
describe("background audio privacy", () => {
  it("accepts disabling or locally hosted audio", () => { expect(validMusicUrl("")).toBe(true); expect(validMusicUrl("/audio/background.mp3")).toBe(true); });
  it.each(["https://tracker.example/music.mp3", "//tracker.example/music.mp3", "/\\tracker.example/a.mp3", "javascript:alert(1)", "/audio/file.html", "/audio/a.mp3?email=test@example.com"])("rejects remote, executable or query-bearing audio: %s", value => { expect(validMusicUrl(value)).toBe(false); });
});
