# Testing — HandMade by Mia

## Stack

- **Vitest** (Node environment, no jsdom/React Testing Library) for unit tests on pure logic and integration tests against the isolated test database. Next's own testing guidance notes Vitest doesn't support async Server Components, and this app's interactive surface is almost entirely async Server Components + thin client components that just call a server action — so component-level RTL tests were judged low-value here and deliberately left out in favour of testing the business logic and server actions directly.
- **Playwright** (Chromium) for end-to-end browser journeys, run against a real production build (`next build && next start`) on its own port, per Next's recommendation to test against production code.

## Required versions / setup

- Node.js: **v24.16.0** used in development (Next 16 requires Node ≥ 20.9).
- Install: `npm install`
- Install Playwright's browser once: `npx playwright install chromium`

## Test database

Completely isolated from `dev.db`:

- `.env.test` (committed — every value in it is a disposable fixture, not a real secret) points `DATABASE_URL` at `prisma/test.db`.
- `npm run db:test:reset` deletes `prisma/test.db` (+ sidecars) if present, re-applies migrations, then loads deterministic fixtures from `prisma/seed-test.ts` (distinct from `prisma/seed.ts`, the dev sample catalog).
- Both `npm run test:unit` and `npm run test:e2e` run this reset automatically first (`pretest:*` npm hooks) — every run starts from the same known state.
- `scripts/reset-test-db.mjs` and `prisma/seed-test.ts` both refuse to run unless `DATABASE_URL` contains `test.db`, as a guard against ever pointing this at `dev.db` by accident.
- Vitest loads `.env.test` directly in `vitest.config.mts` and forwards it into test workers via `test.env` — this is what guarantees `lib/prisma.ts` (which reads `DATABASE_URL` at import time) never touches `dev.db` during a test run.
- Playwright's `webServer` command wraps `next build`/`next start` with `dotenv -e .env.test --`, and serves on **port 3100** (not 3000) so it never collides with a developer's own `npm run dev`.

**Stripe is never configured for tests** (`.env.test` uses placeholder keys) — checkout tests only verify the app fails gracefully at that boundary, never a real payment.

## Commands

```bash
npm run db:test:reset   # rebuild + reseed the isolated test database on demand
npm run test:unit       # Vitest — unit + integration tests (resets test DB first)
npm run test:unit:watch # Vitest in watch mode (does NOT auto-reset the DB each save)
npm run test:e2e        # Playwright — full browser suite (builds, starts on :3100, resets test DB first)
npm run test            # alias for test:unit
npm run test:all        # test:unit then test:e2e
```

## Known environmental quirk

Next.js 16's dev server refuses to start a second `next dev` instance for the same project directory, even on a different port. This is why Playwright's `webServer` uses a production build+start rather than `next dev` — it uses Next 16's separate `.next` (not `.next/dev`) output directory, so it runs happily alongside a developer's own `npm run dev` on port 3000.

## CI

A minimal workflow lives at `.github/workflows/test.yml` (lint → typecheck → unit tests → E2E → build). It has not been run on an actual GitHub Actions runner yet — it's written against the exact commands verified locally, but treat its first real run as unverified until it's actually pushed and observed. Steps:

1. `actions/setup-node` with Node 20.9+ (24.x used locally)
2. `npm ci`
3. `npx playwright install --with-deps chromium`
4. `npm run test:unit`
5. `npm run test:e2e`
6. `npm run build` (uses the real `.env`/dev config — not part of the isolated test path, but should still be run in CI to catch build regressions)

## Test layout

- `tests/unit/` — pure functions, no I/O (money formatting, order numbering, rate limiter, cart pricing math).
- `tests/integration/` — Prisma-backed tests against the isolated test DB, and server actions with `next/headers`/`next/navigation`/`@/lib/stripe` mocked via `vi.mock`.
- `e2e/` — Playwright specs driving a real browser against the built app.

## Known untested areas

- A real Stripe payment has never been completed by this suite (deliberately — no live/real test credentials are used here).
- Concurrent/simultaneous requests aren't exercised (e.g. two checkouts racing for the same order-number sequence, or the last unit of stock) — the suite is single-user, sequential by design (`fileParallelism: false`, Playwright `workers: 1`) to keep the shared SQLite test database safe from write contention, which trades away any concurrency coverage.
- Email sending isn't implemented in the app yet, so there's nothing to test there.
- No accessibility-specific automated checks (e.g. axe-core) — accessibility was checked manually per the Stage 2 QA checklist, not automated here.
