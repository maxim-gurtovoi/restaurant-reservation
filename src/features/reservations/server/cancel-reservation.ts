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
    throw new Error('Бронь не найдена');
  }

  // MVP: only CONFIRMED reservations can be cancelled by the user.
  if (existing.status !== 'CONFIRMED') {
    throw new Error(`Нельзя отменить бронь со статусом ${existing.status}`);
  }

  const cancelledAt = new Date();
  const guarded = await prisma.reservation.updateMany({
    where: {
      id: existing.id,
      userId: input.userId,
      status: 'CONFIRMED',
    },
    data: {
      status: 'CANCELLED',
      cancelledAt,
    },
  });

  if (guarded.count !== 1) {
    throw new Error('Статус брони уже изменился. Обновите страницу.');
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
    throw new Error('Не удалось отменить бронь');
  }

  return updated as CancelReservationResult;
}

