// Prisma 7 moved the datasource connection URL out of schema.prisma and into
// this config file (used by the Prisma CLI — `prisma migrate`, `prisma generate`,
// `prisma db seed`). The app itself still reads DATABASE_URL directly via
// lib/prisma.ts / @prisma/client, which is unaffected by this file.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
