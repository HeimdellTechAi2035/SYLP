import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getConnectionString } from "@netlify/database";

// Prisma 7 requires an explicit driver adapter — there is no more implicit
// "read the datasource url from schema.prisma" connection.
//
// Connection string resolution order:
// 1. DATABASE_URL — an explicitly configured database (e.g. a specific Neon
//    project set as the site's real production database) always wins when
//    present, so it's the same database whether the app is running locally,
//    in CI, or deployed. This is checked first deliberately: Netlify DB's
//    own auto-provisioned database (below) would otherwise silently take
//    priority even when a specific DATABASE_URL has been configured.
// 2. Netlify DB's own env vars (NETLIFY_DATABASE_URL / friends), read via
//    getConnectionString() — present automatically once deployed on Netlify,
//    and locally whenever this process is run inside `netlify dev`. Falls
//    back to this only when DATABASE_URL isn't set, e.g. a preview/branch
//    deploy that hasn't been given its own explicit database.
function resolveConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  try {
    return getConnectionString();
  } catch {
    throw new Error(
      "No database connection available — run inside `netlify dev`, or set DATABASE_URL for local/test use."
    );
  }
}

const adapter = new PrismaPg({ connectionString: resolveConnectionString() });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
