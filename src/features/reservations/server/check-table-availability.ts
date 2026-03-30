import 'server-only';
import { prisma } from '@/lib/prisma';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
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

  const { startAt, endAt } = computeReservationWindow({ date, time });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
  });

  // Query reservations that block availability
  // These are overlapping reservations with statuses: CONFIRMED or CHECKED_IN
  const blockingReservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      status: {
        in: ['CONFIRMED', 'CHECKED_IN'],
      },
      // Overlap detection:
      // existing.startAt < requestedEnd AND existing.endAt > requestedStart
      startAt: {
        lt: endAt,
      },
      endAt: {
        gt: startAt,
      },
    },
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
