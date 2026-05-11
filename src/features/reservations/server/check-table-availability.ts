import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  assertBookingLeadAllowed,
  assertNotBlockedWindow,
  getEffectiveLeadMinutes,
  parseBlockedRecurrenceJson,
} from '@/features/reservations/lib/booking-rules';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { prismaWhereBlockingReservationOverlap } from '@/features/reservations/server/reservation-blocking';
import { ensureWorkingHoursAllowReservation } from '@/features/reservations/server/working-hours-validation';

export async function checkTableAvailability(input: {
  restaurantId: string;
  date: string;
  time: string;
}): Promise<{
  unavailableTableIds: string[];
  requestedStartAt: string;
  requestedEndAt: string;
}> {
  const { restaurantId, date, time } = input;

  const restaurantRow = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      timeZone: true,
      minBookingLeadMinutes: true,
      blockedRecurrenceJson: true,
    },
  });
  const timeZone = getRestaurantIanaZone(restaurantRow ?? { timeZone: null });
  const { startAt, endAt } = computeReservationWindow({ date, time, timeZone });

  const leadMinutes = getEffectiveLeadMinutes(restaurantRow?.minBookingLeadMinutes ?? null);
  assertBookingLeadAllowed({ startAt, timeZone, leadMinutes });

  const blockedRows = parseBlockedRecurrenceJson(restaurantRow?.blockedRecurrenceJson ?? null);
  assertNotBlockedWindow({ startAt, endAt, timeZone, blocks: blockedRows });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
    timeZone,
  });

  const now = new Date();
  const blockingReservations = await prisma.reservation.findMany({
    where: prismaWhereBlockingReservationOverlap({
      restaurantId,
      requestedStartAt: startAt,
      requestedEndAt: endAt,
      now,
    }),
    select: {
      tableId: true,
    },
  });

  const unavailableTableIds = [...new Set(blockingReservations.map((r) => r.tableId))];

  return {
    unavailableTableIds,
    requestedStartAt: startAt.toISOString(),
    requestedEndAt: endAt.toISOString(),
  };
}
