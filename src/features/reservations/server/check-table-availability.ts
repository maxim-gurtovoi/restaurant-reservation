import 'server-only';
import { prisma } from '@/lib/prisma';

const RESERVATION_DURATION_MINUTES = 90;

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

  // Parse date and time into ISO strings
  const [year, month, day] = date.split('-');
  const [hours, minutes] = time.split(':');

  const startAt = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    0,
    0,
  );

  const endAt = new Date(startAt.getTime() + RESERVATION_DURATION_MINUTES * 60 * 1000);

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
