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
    command: `dotenv -e .env.test -- npx next build && dotenv -e .env.test -- npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
