// Resets the isolated test database: deletes prisma/test.db (+ sidecar files),
// re-applies migrations, then loads deterministic fixtures via prisma/seed-test.ts.
// Never touches dev.db. Expects DATABASE_URL to already point at the test db
// (run via `dotenv -e .env.test --`, see package.json scripts).
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("test.db")) {
  console.error(`Refusing to reset — DATABASE_URL does not point at a test.db file: ${dbUrl}`);
  process.exit(1);
}

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const path = `prisma/test.db${suffix}`;
  if (existsSync(path)) rmSync(path);
}

console.log("Applying migrations to test database...");
execSync("npx prisma migrate deploy", { stdio: "inherit" });

console.log("Seeding test fixtures...");
execSync("node --experimental-strip-types prisma/seed-test.ts", { stdio: "inherit" });

console.log("Test database ready.");
