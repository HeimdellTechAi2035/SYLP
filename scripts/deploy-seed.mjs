// Runs after Netlify's own migration system (netlify/database/migrations,
// applied automatically by the platform before build.command even starts —
// see netlify.toml) has created the schema. This step only seeds data, so it
// never touches schema permissions at all.
//
// DATABASE_URL (an explicitly configured database, e.g. a specific Neon
// project set as the site's real production database) takes priority over
// Netlify DB's own auto-provisioned one — same resolution order as
// lib/prisma.ts, kept in sync deliberately so build-time seeding and the
// running app always agree on which database they're talking to.
import { getConnectionString } from "@netlify/database";
import pg from "pg";
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL || getConnectionString();

async function waitForSchema(attempts = 10, delayMs = 3000) {
  for (let i = 1; i <= attempts; i++) {
    const client = new pg.Client({ connectionString: url });
    await client.connect();
    const exists = await client.query(`SELECT to_regclass('public."AdminUser"') as t`);
    await client.end();
    if (exists.rows[0].t) {
      console.log(`[deploy-seed] Schema present after ${i} check(s).`);
      return;
    }
    console.log(`[deploy-seed] Schema not there yet (check ${i}/${attempts}), waiting ${delayMs}ms...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Schema never appeared — Netlify's migration step (netlify/database/migrations) may not have run.");
}

await waitForSchema();

console.log("[deploy-seed] Seeding...");
execSync("node --experimental-strip-types prisma/seed.ts", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
