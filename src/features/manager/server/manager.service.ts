import 'server-only';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';

export type ManagerReservationListItem = {
  id: string;
  status: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  checkedInAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  restaurant: {
    name: string;
  };
  table: {
    label: string;
  };
  contactName: string;
  qrToken: string;
};

export async function listManagerReservations(input: {
  managerUserId: string;
}): Promise<ApiResult<ManagerReservationListItem[]>> {
  const reservations = await prisma.reservation.findMany({
    where: {
      restaurant: {
        managers: {
          some: {
            userId: input.managerUserId,
          },
        },
      },
    },
    orderBy: [
      { startAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      status: true,
      guestCount: true,
      startAt: true,
      endAt: true,
      checkedInAt: true,
      cancelledAt: true,
      createdAt: true,
      qrToken: true,
      contactName: true,
      restaurant: {
        select: {
          name: true,
        },
      },
      table: {
        select: {
          label: true,
        },
      },
    },
  });

  const dto: ManagerReservationListItem[] = reservations.map((r) => ({
    id: r.id,
    status: r.status,
    guestCount: r.guestCount,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt.toISOString(),
    checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
    cancelledAt: r.cancelledAt ? r.cancelledAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    restaurant: r.restaurant,
    table: r.table,
    contactName: r.contactName,
    qrToken: r.qrToken,
  }));

  return { status: 200, body: dto };
}


