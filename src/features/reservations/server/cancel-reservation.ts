import 'server-only';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canGuestCancelConfirmedReservation } from '@/features/reservations/lib/reservation-lifecycle-policy';
import { ReservationLifecycleError } from '@/features/reservations/server/reservation-lifecycle-error';

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
      startAt: true,
    },
  });

  if (!existing) {
    throw new ReservationLifecycleError('NOT_FOUND', 'Бронь не найдена');
  }

  // MVP: only CONFIRMED reservations can be cancelled by the user.
  if (existing.status !== 'CONFIRMED') {
    throw new ReservationLifecycleError(
      'INVALID_STATUS',
      `Нельзя отменить бронь со статусом ${existing.status}`,
    );
  }

  const now = new Date();
  if (!canGuestCancelConfirmedReservation(existing.startAt, now)) {
    throw new ReservationLifecycleError(
      'CANCELLATION_CLOSED',
      'Нельзя отменить бронь после времени начала',
    );
  }

  const cancelledAt = now;
  const guarded = await prisma.reservation.updateMany({
    where: {
      id: existing.id,
      userId: input.userId,
      status: 'CONFIRMED',
      startAt: { gt: now },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt,
    },
  });

  if (guarded.count !== 1) {
    throw new ReservationLifecycleError('CONFLICT', 'Статус брони уже изменился. Обновите страницу.');
  }

  const updated = await prisma.reservation.findUnique({
    where: { id: existing.id },
    select: {
      id: true,
      status: true,
      cancelledAt: true,
    },
  });

  // Prisma schema defines cancelledAt as nullable, but update sets it.
  if (!updated?.cancelledAt) {
    throw new ReservationLifecycleError('CONFLICT', 'Не удалось отменить бронь');
  }

  return updated as CancelReservationResult;
}

