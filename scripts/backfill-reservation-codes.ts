/**
 * Backfills `Reservation.referenceCode` for rows created before the column existed.
 *
 * Run once between migrations:
 *   1. 20260420120000_reservation_reference_code (adds nullable column)
 *   2. npx tsx scripts/backfill-reservation-codes.ts  <-- this script
 *   3. 20260420120100_reservation_reference_code_not_null (NOT NULL + UNIQUE)
 *
 * Idempotent: safe to re-run. Only rows with NULL referenceCode are touched.
 */
import { randomInt } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

const MAX_PER_ROW_RETRIES = 10;

function generateReferenceCode(): string {
  return String(randomInt(1_000_000, 10_000_000));
}

function isReferenceCodeUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;
  const target = (error.meta as { target?: unknown } | undefined)?.target;
  if (typeof target === 'string') return target.includes('referenceCode');
  if (Array.isArray(target)) return target.some((t) => String(t).includes('referenceCode'));
  return true;
}

async function main() {
  const pending = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id"::text AS "id"
    FROM "Reservation"
    WHERE "referenceCode" IS NULL
    ORDER BY "createdAt" ASC
  `;

  // eslint-disable-next-line no-console -- CLI script
  console.log(`Backfill candidates: ${pending.length}`);

  let ok = 0;
  let failed = 0;

  for (const row of pending) {
    let updated = false;
    for (let attempt = 0; attempt < MAX_PER_ROW_RETRIES; attempt += 1) {
      const code = generateReferenceCode();
      try {
        const affected = await prisma.$executeRaw`
          UPDATE "Reservation"
          SET "referenceCode" = ${code}
          WHERE "id" = ${row.id}::uuid AND "referenceCode" IS NULL
        `;
        if (affected === 1) {
          ok += 1;
          updated = true;
          break;
        }
        // Row was already updated by a concurrent run — count as ok and move on.
        ok += 1;
        updated = true;
        break;
      } catch (error) {
        if (isReferenceCodeUniqueViolation(error)) {
          // Collision against an existing code — try a new one.
          continue;
        }
        throw error;
      }
    }

    if (!updated) {
      failed += 1;
      // eslint-disable-next-line no-console -- CLI script
      console.error(
        `Failed to assign unique referenceCode for reservation ${row.id} after ${MAX_PER_ROW_RETRIES} retries`,
      );
    }
  }

  // eslint-disable-next-line no-console -- CLI script
  console.log(JSON.stringify({ processed: pending.length, ok, failed }));

  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
