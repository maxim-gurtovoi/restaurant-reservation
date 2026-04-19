import 'server-only';

import { prisma } from '@/lib/prisma';

export type StaleTransitionResult = {
  /** Rows moved CONFIRMED → NO_SHOW (slot ended, no check-in). */
  noShowCount: number;
  /** Rows moved CHECKED_IN → COMPLETED (slot ended after visit). */
  completedCount: number;
};

/**
 * Idempotent background normalization (safe to run repeatedly).
 * - CONFIRMED + endAt ≤ now → NO_SHOW
 * - CHECKED_IN + endAt ≤ now → COMPLETED
 */
export async function applyStaleReservationTransitions(
  now: Date = new Date(),
): Promise<StaleTransitionResult> {
  const [noShow, completed] = await prisma.$transaction([
    prisma.reservation.updateMany({
      where: {
        status: 'CONFIRMED',
        endAt: { lte: now },
      },
      data: { status: 'NO_SHOW' },
    }),
    prisma.reservation.updateMany({
      where: {
        status: 'CHECKED_IN',
        endAt: { lte: now },
      },
      data: { status: 'COMPLETED' },
    }),
  ]);

  return { noShowCount: noShow.count, completedCount: completed.count };
}
