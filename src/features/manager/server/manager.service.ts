import 'server-only';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';

export async function performCheckIn(input: {
  managerId: string;
  qrCode: string;
}): Promise<ApiResult<{ reservationId: string }>> {
  void input;
  void prisma;
  // TODO: decode QR, find reservation, validate ownership, update status
  return { status: 200, body: { reservationId: 'TODO-reservation-id' } };
}

