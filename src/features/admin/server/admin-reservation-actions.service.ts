import 'server-only';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { confirmCheckInByReservationId } from '@/features/admin/server/check-in.service';
import { reservationWhereStaffOrManager } from '@/server/restaurant-staff-access';
import { canMarkNoShowAfterSlotEnd } from '@/features/reservations/lib/reservation-lifecycle-policy';
import { ReservationLifecycleError } from '@/features/reservations/server/reservation-lifecycle-error';

export type AdminReservationAction =
  | 'check_in'
  | 'complete'
  | 'cancel'
  | 'no_show';

async function assertAdminOwnsReservation(input: {
  reservationId: string;
  adminUserId: string;
}) {
  const row = await prisma.reservation.findFirst({
    where: {
      AND: [
        { id: input.reservationId },
        reservationWhereStaffOrManager(input.adminUserId),
      ],
    },
    select: { id: true, status: true, endAt: true },
  });
  if (!row) {
    throw new ReservationLifecycleError('NOT_FOUND', 'Бронь не найдена');
  }
  return row;
}

/**
 * Allowed transitions (hall admin operational workflow):
 * - CONFIRMED → CHECKED_IN (check-in)
 * - CONFIRMED → CANCELLED
 * - CONFIRMED → NO_SHOW
 * - CHECKED_IN → COMPLETED
 */
export async function applyAdminReservationAction(input: {
  reservationId: string;
  adminUserId: string;
  action: AdminReservationAction;
}): Promise<{ status: ReservationStatus }> {
  const { reservationId, adminUserId, action } = input;

  if (action === 'check_in') {
    const result = await confirmCheckInByReservationId({
      reservationId,
      adminUserId,
    });
    return { status: result.status };
  }

  const current = await assertAdminOwnsReservation({ reservationId, adminUserId });

  if (action === 'complete') {
    if (current.status !== 'CHECKED_IN') {
      throw new ReservationLifecycleError(
        'INVALID_STATUS',
        `Нельзя отметить завершение при статусе ${current.status}`,
      );
    }
    const guarded = await prisma.reservation.updateMany({
      where: { id: reservationId, status: 'CHECKED_IN' },
      data: { status: 'COMPLETED' },
    });
    if (guarded.count !== 1) {
      throw new ReservationLifecycleError('CONFLICT', 'Статус брони уже изменился. Обновите страницу.');
    }
    return { status: 'COMPLETED' };
  }

  if (action === 'cancel') {
    if (current.status !== 'CONFIRMED') {
      throw new ReservationLifecycleError(
        'INVALID_STATUS',
        `Нельзя отменить при статусе ${current.status}`,
      );
    }
    const now = new Date();
    const guarded = await prisma.reservation.updateMany({
      where: { id: reservationId, status: 'CONFIRMED' },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    });
    if (guarded.count !== 1) {
      throw new ReservationLifecycleError('CONFLICT', 'Статус брони уже изменился. Обновите страницу.');
    }
    return { status: 'CANCELLED' };
  }

  if (action === 'no_show') {
    if (current.status !== 'CONFIRMED') {
      throw new ReservationLifecycleError(
        'INVALID_STATUS',
        `Нельзя отметить неявку при статусе ${current.status}`,
      );
    }
    const now = new Date();
    if (!canMarkNoShowAfterSlotEnd(current.endAt, now)) {
      throw new ReservationLifecycleError(
        'NO_SHOW_TOO_EARLY',
        'Нельзя отметить неявку до окончания брони',
      );
    }
    const guarded = await prisma.reservation.updateMany({
      where: { id: reservationId, status: 'CONFIRMED' },
      data: { status: 'NO_SHOW' },
    });
    if (guarded.count !== 1) {
      throw new ReservationLifecycleError('CONFLICT', 'Статус брони уже изменился. Обновите страницу.');
    }
    return { status: 'NO_SHOW' };
  }

  throw new ReservationLifecycleError('VALIDATION', 'Недопустимое действие');
}
