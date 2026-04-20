import 'server-only';
import type { ApiError, ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';
import { checkTableAvailability } from './check-table-availability';
import { createReservation as createReservationInDb } from './create-reservation';
import { WorkingHoursDomainError } from './working-hours-validation';

export type UserReservationListItem = {
  id: string;
  referenceCode: string;
  status: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  createdAt: string;
  restaurant: {
    name: string;
    slug: string;
  };
  table: {
    label: string;
  };
};

export async function listUserReservations(input: {
  userId: string;
}): Promise<ApiResult<UserReservationListItem[]>> {
  const reservations = await prisma.reservation.findMany({
    where: {
      userId: input.userId,
    },
    orderBy: [
      { startAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      referenceCode: true,
      status: true,
      guestCount: true,
      startAt: true,
      endAt: true,
      createdAt: true,
      restaurant: {
        select: {
          name: true,
          slug: true,
        },
      },
      table: {
        select: {
          label: true,
        },
      },
    },
  });

  const dto: UserReservationListItem[] = reservations.map((r) => ({
    id: r.id,
    referenceCode: r.referenceCode,
    status: r.status,
    guestCount: r.guestCount,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    restaurant: r.restaurant,
    table: r.table,
  }));

  return { status: 200, body: dto };
}

export async function createReservation(input: {
  userId: string | null;
  restaurantId: string;
  tableId: string;
  date: string;
  time: string;
  guestCount: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): Promise<
  ApiResult<{
    id: string;
    qrToken: string;
    referenceCode: string;
    startAt: string;
    endAt: string;
    tableLabel: string;
    restaurantName: string;
  }>
> {
  try {
    const result = await createReservationInDb(input);
    return { status: 201, body: result };
  } catch (error) {
    if (error instanceof WorkingHoursDomainError) {
      return {
        status: 400,
        body: { error: error.message, code: error.code },
      };
    }
    const message = error instanceof Error ? error.message : 'Не удалось создать бронь';
    console.error('Error creating reservation:', error);
    const err: ApiError = { status: 400, body: { error: message } };
    return err;
  }
}

export async function getAvailability(input: {
  restaurantId: string;
  date: string;
  time: string;
}): Promise<
  ApiResult<{
    unavailableTableIds: string[];
    requestedStartAt: string;
    requestedEndAt: string;
  }>
> {
  try {
    const result = await checkTableAvailability(input);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof WorkingHoursDomainError) {
      return { status: 400, body: { error: error.message, code: error.code } };
    }
    console.error('Error checking availability:', error);
    const err: ApiError = {
      status: 500,
      body: { error: 'Не удалось проверить доступность' },
    };
    return err;
  }
}
