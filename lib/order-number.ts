import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SEQUENCE_ID = 1;
const MAX_ALLOCATION_ATTEMPTS = 5;

/**
 * Atomically allocates the next human-readable order number (HM-xxxx).
 *
 * Not derived from prisma.order.count() — two concurrent checkouts reading
 * the same count() snapshot before either inserted could compute the same
 * number, with the loser hitting an unhandled Prisma P2002. This instead
 * increments a dedicated single-row counter via upsert, which SQLite/Prisma
 * compiles to a single atomic statement, so concurrent callers can never be
 * handed the same value. It's independent of Order rows entirely, so
 * deleting an order can never cause a number to be reused.
 */
export async function allocateOrderNumber(): Promise<string> {
  const seq = await prisma.orderSequence.upsert({
    where: { id: SEQUENCE_ID },
    create: { id: SEQUENCE_ID, value: 1000 },
    update: { value: { increment: 1 } },
  });
  return `HM-${seq.value}`;
}

/**
 * P2002's `meta` shape differs by driver: Postgres-style adapters report
 * `meta.target` (an array of column names) directly, while the SQLite driver
 * adapter nests it as `meta.driverAdapterError.cause.constraint.fields`.
 * Checking both keeps this correct if the datasource ever changes.
 */
function isOrderNumberClash(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") return false;

  const meta = err.meta as Record<string, unknown> | undefined;
  if (Array.isArray(meta?.target) && meta.target.includes("orderNumber")) return true;

  const driverAdapterError = meta?.driverAdapterError as { cause?: { constraint?: { fields?: unknown } } } | undefined;
  const fields = driverAdapterError?.cause?.constraint?.fields;
  return Array.isArray(fields) && fields.includes("orderNumber");
}

/**
 * Allocates a fresh order number and runs `create` with it, retrying with a
 * newly allocated number if (in an extremely unlikely residual scenario) the
 * unique constraint on orderNumber still rejects it — rather than letting a
 * raw Prisma error reach the customer's checkout. The atomic counter above
 * should make that branch dead code in practice; this is a safety net, not
 * the primary uniqueness mechanism.
 */
export async function createOrderWithUniqueNumber<T>(create: (orderNumber: string) => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ALLOCATION_ATTEMPTS; attempt++) {
    const orderNumber = await allocateOrderNumber();
    try {
      return await create(orderNumber);
    } catch (err) {
      if (!isOrderNumberClash(err) || attempt === MAX_ALLOCATION_ATTEMPTS) throw err;
    }
  }
  throw new Error("unreachable");
}
