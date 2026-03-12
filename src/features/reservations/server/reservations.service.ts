import 'server-only';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';

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
}): Promise<ApiResult<{ slots: string[] }>> {
  void input;
  void prisma; // TODO: compute availability per table/time
  return { status: 200, body: { slots: [] } };
}

