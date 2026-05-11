import 'server-only';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';
import { checkTableAvailability } from './check-table-availability';
import { createReservation as createReservationInDb } from './create-reservation';
import { BookingRulesDomainError } from '@/features/reservations/lib/booking-rules';
import { WorkingHoursDomainError } from './working-hours-validation';

export type UserReservationListItem = {
  id: string;
  referenceCode: string;
  status: string;
  startAt: Date;
  endAt: Date;
  guestCount: number;
  restaurant: { name: string };
  table: { label: string };
};

const USER_RESERVATIONS_MAX = 200;

export async function listUserReservations(input: {
  userId: string;
  /** 1-based page number, defaults to 1 */
  page?: number;
}): Promise<ApiResult<UserReservationListItem[]>> {
  const take = USER_RESERVATIONS_MAX;
  const skip = ((input.page ?? 1) - 1) * take;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: input.userId },
      orderBy: { startAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        referenceCode: true,
        status: true,
        startAt: true,
        endAt: true,
        guestCount: true,
        restaurant: { select: { name: true } },
        table: { select: { label: true } },
      },
    });

    return { status: 200, body: reservations };
  } catch (error) {
    console.error('Error loading user reservations:', error);
    return {
      status: 500,
      body: { error: 'Не удалось загрузить бронирования' },
    };
  }
}

export async function createReservation(input: {
  userId: string;
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
    console.error('Error creating reservation:', error);
    if (error instanceof WorkingHoursDomainError) {
      return { status: 422, body: { error: error.message, code: error.code } };
    }
    if (error instanceof BookingRulesDomainError) {
      return { status: 422, body: { error: error.message, code: error.code } };
    }
    if (error instanceof Error) {
      return { status: 400, body: { error: error.message } };
    }
    return { status: 500, body: { error: 'Failed to create reservation' } };
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
    const result = await checkTableAvailability(
      input as Parameters<typeof checkTableAvailability>[0],
    );
    return { status: 200, body: result };
  } catch (error) {
    console.error('Error checking availability:', error);
    if (error instanceof WorkingHoursDomainError) {
      return {
        status: 422,
        body: { error: error.message, code: error.code },
      };
    }
    if (error instanceof BookingRulesDomainError) {
      return {
        status: 422,
        body: { error: error.message, code: error.code },
      };
    }
    return {
      status: 500,
      body: { error: 'Failed to check availability' },
    };
  }
}
