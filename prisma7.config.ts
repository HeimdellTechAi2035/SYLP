// Prisma 7 moved the datasource connection URL out of schema.prisma and into
// this config file (used by the Prisma CLI — `prisma migrate`, `prisma generate`,
// `prisma db seed`). The app itself resolves its own connection via
// lib/prisma.ts (NETLIFY_DB_URL first, DATABASE_URL fallback — see the
// comment there), which is unaffected by this file. This config needs the
// same fallback: when these CLI commands run through `netlify dev --command`
// (as db:migrate/db:seed do), Netlify's DB extension injects the local
// connection string as NETLIFY_DB_URL, never as DATABASE_URL — without this
// fallback, `prisma migrate dev` fails with "datasource.url is required"
// even though a working connection is sitting right there in the environment.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || process.env.NETLIFY_DB_URL,
  },
});
