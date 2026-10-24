# Security — Support Your Local Patriot

## Environment variables

| Variable | Where it's read | Ever reaches the browser? |
|---|---|---|
| `DATABASE_URL` | `lib/prisma.ts`, `prisma7.config.ts`, seed scripts — all server/CLI-only | No |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed scripts only, to bootstrap the first `AdminUser` row (bcrypt-hashed on write) | No — and not used for runtime login (see below) |
| `SESSION_SECRET` | `lib/auth.ts`, `lib/customer-auth.ts`, `proxy.ts` — all server-only | No |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` only | No |
| `STRIPE_WEBHOOK_SECRET` | `app/api/stripe/webhook/route.ts` only (a Route Handler — never bundled to the client) | No |
| `STRIPE_PUBLISHABLE_KEY` | Not currently read anywhere in the codebase | N/A — unused (see note below) |
| `NEXT_PUBLIC_SITE_URL` | Several server-side files (metadata, sitemap, robots, checkout redirect URLs) | Yes, by design — it's a public URL, not a secret, and is the only `NEXT_PUBLIC_`-prefixed variable in the project |

**Note on the publishable key**: checkout currently redirects to a Stripe-hosted Checkout Session rather than embedding Stripe.js/Elements in-page, so nothing client-side needs the publishable key yet. If embedded Elements are added later, expose it as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (never rename `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` with a `NEXT_PUBLIC_` prefix).

**On `ADMIN_PASSWORD`**: this is a one-time bootstrap value consumed only by `prisma/seed.ts` to create the initial `AdminUser` row with a bcrypt hash. Runtime login (`lib/actions/admin-auth.ts`) checks the submitted password against that stored hash via `bcrypt.compare` — it never reads `process.env.ADMIN_PASSWORD`. Changing the password via Admin → Site Settings updates the database hash; the env var becomes irrelevant after first seed.

Verified: no client component (`"use client"` file) imports `lib/prisma.ts`, `lib/auth.ts`, `lib/customer-auth.ts`, or `lib/stripe.ts` directly, or reads `process.env` itself. Every client component that touches server logic does so exclusively through a `"use server"` action, which is the React/Next.js server/client boundary — only the action's callable reference crosses to the browser, never its implementation, its imports, or any environment variable it reads.

## Source control

- `.env`, `.env.local`, `.env.*.local` are all gitignored via `.env*` in `.gitignore`, and confirmed with `git check-ignore` against every variant.
- `.env.example` and `.env.test` are the two deliberate exceptions (both explicitly un-ignored): `.env.example` holds variable names with placeholder values only; `.env.test` holds disposable fixture values for the isolated test database and CI (see `TESTING.md`) — neither has ever contained a real credential.
- `dev.db` and `prisma/test.db` are gitignored (root-level and `/prisma` locations both covered, since `DATABASE_URL="file:./dev.db"` resolves relative to process cwd, not to `/prisma`).
- No `.db`, `.sqlite`, or backup file of any kind is tracked by git (`git ls-files` confirmed empty for these patterns).

## Database access model

The database is infrastructure the **app server** talks to — nothing in the browser ever queries it directly, and no code path makes the database connection conditional on an admin session (that would break checkout, cart, product browsing, and every other normal customer-facing feature, which also need server-side DB access while unauthenticated).

Instead, every *sensitive* mutation independently re-checks authorization at the point of the mutation:

- **Admin operations** — all 37 exported functions across `lib/actions/admin/*.ts` call `requireAdminSession()` as their first statement, before any database write. This was verified by direct inspection (grep cross-reference, 37 functions / 37 guard calls) and by new automated tests (below) proving the guard blocks both an unauthenticated caller and a caller who holds a valid *customer* session but not an admin one.
- **Customer operations** — every account mutation (`lib/actions/addresses.ts`, `lib/actions/account-settings.ts`) scopes its query by `session.sub` (the verified customer id from the session, never a client-supplied id), and the order-detail page (`account/orders/[id]`) explicitly checks `order.customerId !== session.sub` before rendering anything, returning a generic 404 rather than a 403 (so the response doesn't reveal whether the order exists at all).

## Stripe

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are read only in `lib/stripe.ts` and `app/api/stripe/webhook/route.ts` respectively — both server-only execution contexts. The webhook route verifies every request's `stripe-signature` header via `stripe.webhooks.constructEvent` before trusting anything in the payload, and (as of this audit) logs verification failures server-side while returning only a generic `"Invalid signature"` to the caller — the underlying Stripe SDK exception message is no longer echoed in the HTTP response.

## Session cookies

Both admin and customer sessions (`lib/auth.ts`, `lib/customer-auth.ts`) set cookies with `httpOnly: true`, `secure: true` in production, and `sameSite: "lax"` (the correct choice here specifically because checkout redirects to Stripe and back — `strict` would drop the cart cookie on that return trip). Login rate limiting (`lib/rate-limit.ts`) blocks after 5 failed attempts per IP+email within 5 minutes, and — since a prior audit — only counts failed attempts, so a legitimate user logging in correctly several times in a row can never lock themselves out.

## Error and log sanitisation

No `console.*` call exists anywhere in `app/`, `lib/`, or `components/` except the one added by this audit (the sanitised webhook-failure log, which prints only the Stripe SDK's own diagnostic message — never `STRIPE_WEBHOOK_SECRET` itself, which the SDK never includes in that message). Next.js's own production error handling already redacts Server Component render errors before they reach the browser (confirmed empirically during E2E runs — the client only ever sees a generic message with an opaque `digest`).

## Production database requirements (documentation only — not migrated in this pass)

When moving to hosted PostgreSQL:

- `DATABASE_URL` lives **only** in the deployment platform's encrypted environment/secrets store (e.g., Vercel/Railway/Fly project secrets) — never in a committed file, never in a build log.
- The connection **must** use TLS/SSL (`sslmode=require` or the provider's equivalent) — refuse to boot in production if the connection isn't encrypted.
- The database user the app connects as should be **least-privileged**: grants limited to the app's own schema/tables (`SELECT`/`INSERT`/`UPDATE`/`DELETE` as needed) — not a superuser/owner role, and definitely not the account used for migrations if that can be separated.
- Restrict network access at the provider level where supported (IP allowlist / VPC peering / private networking) so the database isn't reachable from the open internet at all, only from the app's own compute.
- Production, staging/test, and local development must be **fully separate database instances** — never the same instance with different schemas, and `TEST_DATABASE_URL` (or this project's `.env.test` equivalent) must never be able to resolve to the production host, even by misconfiguration. (This project's own test harness already guards this locally: `scripts/reset-test-db.mjs` and `prisma/seed-test.ts` both refuse to run unless `DATABASE_URL` contains `test.db`.)
- Automated backups must be enabled at the provider level, with a tested restore procedure — a backup nobody has restored from is not a backup.
- Rotate database credentials independently of application secrets (Stripe keys, session secret) — a rotation schedule or an incident affecting one shouldn't require touching the other.
- No connection string, credential, or `.pgpass`-style file is ever committed to the repository, including in a "temporary" debugging commit.

No provider has been chosen yet and no credentials have been invented for this document — it states requirements to satisfy whenever a provider is selected, not a specific provider's setup steps.

## Known residual risks (not fixed in this pass — documented deliberately)

- Prisma's own `log: ["error"]` output (server stdout only, never sent to the browser) could in rare connection-failure scenarios include the datasource URL as part of Prisma's own internal error text. This is server-log-only exposure (visible only to whoever has direct access to server/hosting logs, not to any customer or API caller) and wasn't altered, since suppressing Prisma's own internal diagnostic content isn't something the app can safely do at the field level without losing genuinely useful operational information.
- Admin `role` (`OWNER` / `STAFF`) exists on the `AdminUser` model but nothing in the code currently branches on it — any authenticated admin session has full access regardless of role. Out of scope for this pass (not a vulnerability relative to the current single-admin design, just an unbuilt feature).
