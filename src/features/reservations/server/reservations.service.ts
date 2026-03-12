import 'server-only';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';
import { checkTableAvailability } from './check-table-availability';

export async function listUserReservations(input: {
  userId: string;
}): Promise<ApiResult<Array<{ id: string }>>> {
  void input;
  void prisma; // TODO: query reservations for user
  return { status: 200, body: [] };
}

export async function createReservation(input: any): Promise<ApiResult<{ id: string }>> {
  void input;
  void prisma; // TODO: validate availability + create reservation
  return { status: 201, body: { id: 'TODO-reservation-id' } };
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
    return {
      status: 500,
      body: { error: 'Failed to check availability' } as any,
    };
  }
}
