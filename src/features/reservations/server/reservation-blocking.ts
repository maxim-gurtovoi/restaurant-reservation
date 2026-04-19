import 'server-only';

import type { Prisma } from '@prisma/client';

/** Statuses that occupy a table slot when overlapping a requested window. */
export const BLOCKING_RESERVATION_STATUSES = ['CONFIRMED', 'CHECKED_IN'] as const;

/**
 * Overlap: existing.startAt < requestedEnd AND existing.endAt > requestedStart.
 * Additionally: existing.endAt > now — once the planned slot has ended (UTC), the row does not
 * block new bookings even if the manager has not yet closed the visit (operational status may lag).
 */
export function prismaWhereBlockingReservationOverlap(input: {
  restaurantId: string;
  requestedStartAt: Date;
  requestedEndAt: Date;
  now: Date;
  tableId?: string;
}): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {
    restaurantId: input.restaurantId,
    status: { in: [...BLOCKING_RESERVATION_STATUSES] },
    AND: [
      { endAt: { gt: input.now } },
      { startAt: { lt: input.requestedEndAt } },
      { endAt: { gt: input.requestedStartAt } },
    ],
  };
  if (input.tableId) {
    where.tableId = input.tableId;
  }
  return where;
}
