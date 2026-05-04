import 'server-only';
import type { CheckInMethod, ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { restaurantWhereStaffOrManager } from '@/server/restaurant-staff-access';
import {
  CHECKIN_EARLY_GRACE_MINUTES,
  CHECKIN_LATE_GRACE_MINUTES,
} from '@/features/reservations/reservation-window';
import { getCheckInTimeWindowViolation } from '@/features/reservations/lib/reservation-lifecycle-policy';
import { ReservationLifecycleError } from '@/features/reservations/server/reservation-lifecycle-error';

export type CheckInReservationSummary = {
  id: string;
  referenceCode: string;
  status: ReservationStatus;
  guestCount: number;
  startAt: Date;
  endAt: Date;
  qrToken: string;
  contactName: string;
  restaurant: { id: string; name: string };
  table: { label: string };
};

async function assertAdminLinkedToRestaurant(input: {
  adminUserId: string;
  restaurantId: string;
}) {
  const allowed = await prisma.restaurant.findFirst({
    where: {
      id: input.restaurantId,
      ...restaurantWhereStaffOrManager(input.adminUserId),
    },
    select: { id: true },
  });

  if (!allowed) {
    throw new ReservationLifecycleError('FORBIDDEN', 'Нет доступа');
  }
}

export async function getReservationByQrTokenForAdmin(input: {
  adminUserId: string;
  qrToken: string;
}): Promise<CheckInReservationSummary | null> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      qrToken: input.qrToken,
    },
    include: {
      restaurant: { select: { id: true, name: true } },
      table: { select: { label: true } },
    },
  });

  if (!reservation) return null;

  await assertAdminLinkedToRestaurant({
    adminUserId: input.adminUserId,
    restaurantId: reservation.restaurantId,
  });

  return {
    id: reservation.id,
    referenceCode: reservation.referenceCode,
    status: reservation.status,
    guestCount: reservation.guestCount,
    startAt: reservation.startAt,
    endAt: reservation.endAt,
    qrToken: reservation.qrToken,
    contactName: reservation.contactName,
    restaurant: reservation.restaurant,
    table: reservation.table,
  };
}

export type ConfirmCheckInResult = {
  reservationId: string;
  status: ReservationStatus;
  checkedInAt: Date;
  method: CheckInMethod;
};

/**
 * Core check-in: CONFIRMED → CHECKED_IN, with audit log.
 * Used by QR flow and manual check-in from the hall admin reservation detail page.
 */
export async function performAdminCheckIn(input: {
  reservationId: string;
  adminUserId: string;
  method: CheckInMethod;
}): Promise<ConfirmCheckInResult> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId },
    select: {
      id: true,
      status: true,
      restaurantId: true,
      startAt: true,
      endAt: true,
    },
  });

  if (!reservation) {
    throw new ReservationLifecycleError('NOT_FOUND', 'Бронь не найдена');
  }

  await assertAdminLinkedToRestaurant({
    adminUserId: input.adminUserId,
    restaurantId: reservation.restaurantId,
  });

  if (reservation.status !== 'CONFIRMED') {
    throw new ReservationLifecycleError(
      'INVALID_STATUS',
      `Невозможно подтвердить посещение при статусе ${reservation.status}`,
    );
  }

  const now = new Date();
  const windowViolation = getCheckInTimeWindowViolation(
    now,
    reservation.startAt,
    reservation.endAt,
    CHECKIN_EARLY_GRACE_MINUTES,
    CHECKIN_LATE_GRACE_MINUTES,
  );
  if (windowViolation === 'too_early') {
    throw new ReservationLifecycleError(
      'CHECKIN_TOO_EARLY',
      `Слишком рано для check-in. Доступно за ${CHECKIN_EARLY_GRACE_MINUTES} минут до начала`,
    );
  }
  if (windowViolation === 'too_late') {
    throw new ReservationLifecycleError(
      'CHECKIN_TOO_LATE',
      'Слишком поздно для check-in по этой брони',
    );
  }

  const checkedInAt = now;
  const updated = await prisma.$transaction(async (tx) => {
    const guarded = await tx.reservation.updateMany({
      where: {
        id: reservation.id,
        status: 'CONFIRMED',
      },
      data: {
        status: 'CHECKED_IN',
        checkedInAt,
      },
    });

    if (guarded.count !== 1) {
      throw new ReservationLifecycleError(
        'CONFLICT',
        'Бронь уже была изменена другим действием. Обновите страницу.',
      );
    }

    const nextState = await tx.reservation.findUnique({
      where: { id: reservation.id },
      select: {
        id: true,
        status: true,
        checkedInAt: true,
      },
    });

    if (!nextState?.checkedInAt) {
      throw new ReservationLifecycleError('CONFLICT', 'Не удалось подтвердить посещение');
    }

    await tx.checkInLog.create({
      data: {
        reservationId: nextState.id,
        checkedInByUserId: input.adminUserId,
        checkedInAt,
        method: input.method,
        notes: null,
      },
    });

    return nextState;
  });

  return {
    reservationId: updated.id,
    status: updated.status,
    checkedInAt: updated.checkedInAt!,
    method: input.method,
  };
}

export async function confirmCheckInByQrToken(input: {
  adminUserId: string;
  qrToken: string;
}): Promise<ConfirmCheckInResult> {
  const reservation = await prisma.reservation.findFirst({
    where: { qrToken: input.qrToken },
    select: {
      id: true,
    },
  });

  if (!reservation) {
    throw new ReservationLifecycleError('NOT_FOUND', 'Бронь не найдена');
  }

  return performAdminCheckIn({
    reservationId: reservation.id,
    adminUserId: input.adminUserId,
    method: 'QR',
  });
}

/** Manual check-in from hall admin UI (no QR scan). */
export async function confirmCheckInByReservationId(input: {
  adminUserId: string;
  reservationId: string;
}): Promise<ConfirmCheckInResult> {
  return performAdminCheckIn({
    reservationId: input.reservationId,
    adminUserId: input.adminUserId,
    method: 'MANUAL',
  });
}
