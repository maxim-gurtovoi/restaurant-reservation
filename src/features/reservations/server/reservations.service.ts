import 'server-only';
import type { ApiError, ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';
import { checkTableAvailability } from './check-table-availability';
import { createReservation as createReservationInDb } from './create-reservation';

export async function listUserReservations(input: {
  userId: string;
}): Promise<ApiResult<Array<{ id: string }>>> {
  void input;
  void prisma; // TODO: query reservations for user
  return { status: 200, body: [] };
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
    const message = error instanceof Error ? error.message : 'Failed to create reservation';
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
    console.error('Error checking availability:', error);
    const err: ApiError = {
      status: 500,
      body: { error: 'Failed to check availability' },
    };
    return err;
  }
}
