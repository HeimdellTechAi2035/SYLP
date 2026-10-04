// Prisma 7 keeps the datasource connection URL here rather than in
// schema.prisma. Used by the Prisma CLI (`prisma migrate`, `prisma generate`,
// `prisma db seed`); the app itself connects via lib/prisma.ts. Both read
// DATABASE_URL — the Neon connection string.
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
