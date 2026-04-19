import 'server-only';
import { prisma } from '@/lib/prisma';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { getRestaurantIanaZoneById } from '@/features/reservations/server/restaurant-timezone.repository';
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

  const timeZone = await getRestaurantIanaZoneById(restaurantId);
  const { startAt, endAt } = computeReservationWindow({ date, time, timeZone });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
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
