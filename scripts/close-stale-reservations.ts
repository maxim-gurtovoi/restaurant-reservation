/**
 * Run periodically (e.g. cron every 15m) or manually:
 *   npx tsx scripts/close-stale-reservations.ts
 * Requires DATABASE_URL. Same logic as POST /api/cron/close-stale-reservations.
 */
import { prisma } from '../src/lib/prisma';
import { applyStaleReservationTransitions } from '../src/features/reservations/server/stale-reservation-policy';

async function main() {
  const result = await applyStaleReservationTransitions();
  // eslint-disable-next-line no-console -- CLI script
  console.log(JSON.stringify(result));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
