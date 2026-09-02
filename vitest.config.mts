import { defineConfig } from "vitest/config";
import { config as loadEnv } from "dotenv";

// Loaded here (not just relying on process.env) so the parsed values can be
// explicitly forwarded into test worker processes via `test.env` — Vitest runs
// test files in separate workers that do not automatically inherit env
// mutations made only in this config-evaluation process.
const parsed = loadEnv({ path: ".env.test" }).parsed ?? {};

if (!parsed.DATABASE_URL?.includes("test.db")) {
  throw new Error("vitest.config.mts: .env.test must point DATABASE_URL at prisma/test.db — refusing to run.");
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    env: parsed,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // better-sqlite3 is a single-file, single-writer database — run test files
    // serially in one process so concurrent workers never race on file locks.
    pool: "forks",
    fileParallelism: false,
  },
});
