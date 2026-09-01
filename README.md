# HandMade by Mia

A full-stack ecommerce site for a UK handmade wax melt, candle and gift business — built with Next.js 16, Prisma, SQLite (dev) and Stripe. Every piece of day-to-day store data (products, fragrances, orders, discounts, homepage content, delivery settings, policies, reviews, etc.) is managed from the protected **Admin Dashboard** at `/admin` — the database is infrastructure only, never something the store owner touches directly.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates the local SQLite database from prisma/schema.prisma
npm run db:seed          # creates the admin login + sample categories/fragrances/products
npm run dev
```

Open http://localhost:3000 for the storefront, and http://localhost:3000/admin for the admin dashboard.

**Admin login**: the email/password come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (defaults are in `.env.example`). **Change the password immediately** via Admin → Site Settings after first login.

## Environment variables

Copy `.env.example` to `.env` and fill in real values before going further than local development:

- `DATABASE_URL` — SQLite file path for local dev (`file:./dev.db`). See "Moving to Postgres" below for production.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script to create the first admin login.
- `SESSION_SECRET` — long random string signing admin/customer session cookies. A fresh one was generated for you in `.env`; **generate a new one for production** and never reuse the dev value.
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — from your [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys). Checkout is disabled with a friendly error message until these are real keys.
- `NEXT_PUBLIC_SITE_URL` — used to build absolute URLs (Stripe redirect URLs, sitemap, Open Graph).

## Setting up Stripe locally

1. Add your test-mode `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to `.env`.
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy the webhook signing secret it prints into `STRIPE_WEBHOOK_SECRET`.
4. Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

The order confirmation page also reconciles payment status directly from Stripe on load, so checkout works locally even before you've set up the CLI webhook forwarding — the webhook remains the source of truth for production.

## What the Admin Dashboard controls

Everything a store owner needs day-to-day, with no code or database access required:

Products, variants, images, categories, fragrances, inventory, orders, a simple handmade production queue (To Make → Making → Ready to Pack → Packed), customers, gift sets, discount codes, review moderation, returns/refunds (via Stripe), contact messages, legal policy pages, homepage content (hero, story, gift section, "why shop" features), delivery zones/pricing, and general site settings (business info, socials, analytics IDs, admin password).

## Architecture notes

- **Database**: SQLite for local development (zero-config, no external service). The Prisma schema avoids Postgres-only features, so moving to Postgres later is: change `provider` in `prisma/schema.prisma` to `"postgresql"`, swap the driver adapter in `lib/prisma.ts` from `@prisma/adapter-better-sqlite3` to `@prisma/adapter-pg`, point `DATABASE_URL` at your Postgres instance, and re-run `prisma migrate dev`. Nothing else in the app changes.
- **Prisma 7**: the datasource connection URL lives in `prisma7.config.ts` (a Prisma 7 requirement), not in `schema.prisma`. `PrismaClient` requires an explicit driver adapter at runtime — see `lib/prisma.ts`.
- **Auth**: two independent, cookie-based JWT sessions (`lib/auth.ts` for admin, `lib/customer-auth.ts` for shoppers) signed with `SESSION_SECRET`. Admin routes are gated by `proxy.ts` (Next's renamed `middleware.ts`) plus `requireAdminSession()` on every protected page/action — never rely on the proxy alone.
- **Pricing integrity**: the cart is just product/variant IDs + quantities. Subtotal, discount, delivery and total are always recalculated server-side at checkout (`lib/actions/checkout.ts`) — a tampered client-side total cannot change what's charged.
- **Images**: admin image fields currently take a URL string (paste a hosted image link). There's no file upload/cloud storage wired up yet — add one (Vercel Blob, S3, Supabase Storage) before real product photography goes live.
- **Rate limiting**: admin/customer login attempts are rate-limited in-memory (`lib/rate-limit.ts`). This resets on restart and is per-process — fine for a single-instance deployment, but swap for a shared store (e.g. Upstash Redis) before running multiple instances.

## What's intentionally left as a placeholder

- All legal policy pages (`/legal/*`) contain clearly labelled **draft placeholder text** — replace via Admin → Policies with real, reviewed wording before launch. No company number, VAT number, or legal entity details have been invented.
- Seeded fragrances/products/copy are placeholder content for a fictional first collection.
- No reviews are seeded — reviews only ever come from genuine customer submissions via the product page, and require admin approval before appearing publicly.
- No email sending is wired up (order confirmation, dispatch, etc. are shown in-app only) — add a transactional email provider (Resend, Postmark, SES) when ready.

## Testing performed

Every route was verified to render without server errors (200 for public/valid pages, correct redirects for auth-gated pages, correct 404s), and the full production build (`npm run build`) completes cleanly across all 48 routes with no TypeScript or ESLint errors. Interactive flows (clicking through registration, checkout, and admin forms in a real browser) have not been manually tested in this environment — please click through the golden path yourself before relying on it.
