import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shares the isolated SQLite test.db — avoid concurrent-writer contention
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Runs a production build+start against the isolated test database
    // (.env.test) on its own port — never the developer's normal `npm run dev`
    // on 3000 / dev.db. Two reasons this uses build+start rather than `next dev`:
    // 1) Next.js's own testing guidance recommends testing production code.
    // 2) `next dev` refuses to start a second instance for the same project
    //    directory even on a different port, so it would collide with a
    //    developer's own running `npm run dev`. Build/start use Next 16's
    //    separate `.next` (not `.next/dev`) output dir, so this runs happily
    //    alongside a normal `npm run dev` on port 3000.
    //
    // The reset step (delete + re-migrate + reseed test.db) runs right here,
    // as the first link in this same command chain, rather than relying on
    // the `pretest:e2e` npm hook. That hook only fires for `npm run test:e2e`
    // — it's silently skipped by a direct `npx playwright test` (or a CI/IDE
    // runner invoking Playwright directly), which is exactly how stale rows
    // from one run previously survived into the next. Chaining it into
    // `command` makes the reset part of Playwright's own server-startup
    // lifecycle, so it fires no matter how the suite is invoked — and `&&`
    // ensures a failed reset aborts the run instead of testing against a
    // half-reset database.
    command: `dotenv -e .env.test -- node scripts/reset-test-db.mjs && dotenv -e .env.test -- npx next build && dotenv -e .env.test -- npx next start -p ${PORT}`,
    url: baseURL,
    // Always false, even locally: `reuseExistingServer: true` would skip this
    // whole command — reset included — whenever something is already
    // listening on the port (a server left over from an earlier run that
    // didn't shut down cleanly). That reintroduces the exact staleness this
    // config exists to prevent, so every run pays for a fresh build+reseed
    // rather than risk silently reusing a stale server's database state.
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
