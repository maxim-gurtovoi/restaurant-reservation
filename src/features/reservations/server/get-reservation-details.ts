import 'server-only';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type ReservationDetails = {
  id: string;
  status: ReservationStatus;
  guestCount: number;
  startAt: Date;
  endAt: Date;
  qrToken: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  table: {
    id: string;
    label: string;
    capacity: number;
  };
};

export async function getReservationDetailsById(input: {
  reservationId: string;
  userId: string;
}): Promise<ReservationDetails | null> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      userId: input.userId,
    },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true },
      },
      table: {
        select: { id: true, label: true, capacity: true },
      },
    },
  });

  if (!reservation) return null;

  return {
    id: reservation.id,
    status: reservation.status,
    guestCount: reservation.guestCount,
    startAt: reservation.startAt,
    endAt: reservation.endAt,
    qrToken: reservation.qrToken,
    contactName: reservation.contactName,
    contactPhone: reservation.contactPhone,
    contactEmail: reservation.contactEmail,
    cancelledAt: reservation.cancelledAt,
    createdAt: reservation.createdAt,
    restaurant: reservation.restaurant,
    table: reservation.table,
  };
}

