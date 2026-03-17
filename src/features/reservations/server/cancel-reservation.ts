import 'server-only';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type CancelReservationResult = {
  id: string;
  status: ReservationStatus;
  cancelledAt: Date;
};

export async function cancelReservation(input: {
  reservationId: string;
  userId: string;
}): Promise<CancelReservationResult> {
  const existing = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      userId: input.userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    throw new Error('Reservation not found');
  }

  // MVP: only CONFIRMED reservations can be cancelled by the user.
  if (existing.status !== 'CONFIRMED') {
    throw new Error(`Reservation cannot be cancelled from status ${existing.status}`);
  }

  const updated = await prisma.reservation.update({
    where: { id: existing.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      cancelledAt: true,
    },
  });

  // Prisma schema defines cancelledAt as nullable, but update sets it.
  if (!updated.cancelledAt) {
    throw new Error('Failed to cancel reservation');
  }

  return updated as CancelReservationResult;
}

