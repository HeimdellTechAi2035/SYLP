import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = process.cwd();
await mkdir(path.join(root, ".next.prev"), { recursive: true });
const backupFixture = await mkdtemp(path.join(root, ".next.prev/css-regression-"));
const otherFixture = await mkdtemp(path.join(root, "css-scan-noise-"));
try {
  // Simulate cached source and corrupt bytes alongside a production rollback.
  const noise = "z-[97531] bottom-[calc(4rem+env(safe-area-\u0017\u0001\u0002))]";
  await Promise.all([backupFixture, otherFixture].map(folder => writeFile(path.join(folder, "cache.txt"), noise)));
  const from = path.join(root, "app/(storefront)/globals.css");
  const result = await postcss([tailwind({ base: root, optimize: true })]).process(await readFile(from, "utf8"), { from });
  postcss.parse(result.css);
  assert(!result.css.includes("97531"), "Tailwind scanned content outside the authored UI directories");
  assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(result.css), "Generated CSS contains corrupt control bytes");
  assert(result.css.includes("55dvh"), "Mobile chat height utility is missing");
  assert(result.css.includes("safe-area-inset-bottom"), "Mobile safe-area utilities are missing");
  assert(result.css.includes(".min-h-11"), "Touch-target utility is missing");
  console.log("Production CSS compiles; rollback/cache content is excluded; mobile utilities remain present.");
} finally {
  await Promise.all([backupFixture, otherFixture].map(folder => rm(folder, { recursive: true, force: true })));
}
