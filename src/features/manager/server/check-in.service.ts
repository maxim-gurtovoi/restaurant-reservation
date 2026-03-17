import 'server-only';
import type { CheckInMethod, ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type CheckInReservationSummary = {
  id: string;
  status: ReservationStatus;
  guestCount: number;
  startAt: Date;
  endAt: Date;
  qrToken: string;
  contactName: string;
  restaurant: { id: string; name: string };
  table: { label: string };
};

async function assertManagerLinkedToRestaurant(input: {
  managerUserId: string;
  restaurantId: string;
}) {
  const link = await prisma.restaurantManager.findFirst({
    where: {
      userId: input.managerUserId,
      restaurantId: input.restaurantId,
    },
    select: { id: true },
  });

  if (!link) {
    throw new Error('Forbidden');
  }
}

export async function getReservationByQrTokenForManager(input: {
  managerUserId: string;
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

  await assertManagerLinkedToRestaurant({
    managerUserId: input.managerUserId,
    restaurantId: reservation.restaurantId,
  });

  return {
    id: reservation.id,
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

export async function confirmCheckInByQrToken(input: {
  managerUserId: string;
  qrToken: string;
}): Promise<ConfirmCheckInResult> {
  const reservation = await prisma.reservation.findFirst({
    where: { qrToken: input.qrToken },
    select: {
      id: true,
      status: true,
      restaurantId: true,
    },
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  await assertManagerLinkedToRestaurant({
    managerUserId: input.managerUserId,
    restaurantId: reservation.restaurantId,
  });

  // MVP rule: only CONFIRMED can be checked in.
  if (reservation.status !== 'CONFIRMED') {
    throw new Error(`Cannot check in reservation from status ${reservation.status}`);
  }

  const checkedInAt = new Date();

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: 'CHECKED_IN',
      checkedInAt,
    },
    select: {
      id: true,
      status: true,
      checkedInAt: true,
    },
  });

  await prisma.checkInLog.create({
    data: {
      reservationId: updated.id,
      checkedInByUserId: input.managerUserId,
      checkedInAt,
      method: 'QR',
      notes: null,
    },
  });

  if (!updated.checkedInAt) {
    throw new Error('Failed to check in reservation');
  }

  return {
    reservationId: updated.id,
    status: updated.status,
    checkedInAt: updated.checkedInAt,
    method: 'QR',
  };
}

