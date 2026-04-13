import 'server-only';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { confirmCheckInByReservationId } from '@/features/manager/server/check-in.service';

export type ManagerReservationAction =
  | 'check_in'
  | 'complete'
  | 'cancel'
  | 'no_show';

async function assertManagerOwnsReservation(input: {
  reservationId: string;
  managerUserId: string;
}) {
  const row = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      restaurant: {
        managers: { some: { userId: input.managerUserId } },
      },
    },
    select: { id: true, status: true },
  });
  if (!row) {
    throw new Error('Reservation not found');
  }
  return row;
}

/**
 * Allowed transitions (manager operational workflow):
 * - CONFIRMED → CHECKED_IN (check-in)
 * - CONFIRMED → CANCELLED
 * - CONFIRMED → NO_SHOW
 * - CHECKED_IN → COMPLETED
 */
export async function applyManagerReservationAction(input: {
  reservationId: string;
  managerUserId: string;
  action: ManagerReservationAction;
}): Promise<{ status: ReservationStatus }> {
  const { reservationId, managerUserId, action } = input;

  if (action === 'check_in') {
    const result = await confirmCheckInByReservationId({
      reservationId,
      managerUserId,
    });
    return { status: result.status };
  }

  const current = await assertManagerOwnsReservation({ reservationId, managerUserId });

  if (action === 'complete') {
    if (current.status !== 'CHECKED_IN') {
      throw new Error(`Cannot mark complete from status ${current.status}`);
    }
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED' },
      select: { status: true },
    });
    return { status: updated.status };
  }

  if (action === 'cancel') {
    if (current.status !== 'CONFIRMED') {
      throw new Error(`Cannot cancel from status ${current.status}`);
    }
    const now = new Date();
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
      select: { status: true },
    });
    return { status: updated.status };
  }

  if (action === 'no_show') {
    if (current.status !== 'CONFIRMED') {
      throw new Error(`Cannot mark no-show from status ${current.status}`);
    }
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'NO_SHOW' },
      select: { status: true },
    });
    return { status: updated.status };
  }

  throw new Error('Invalid action');
}
