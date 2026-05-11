import 'server-only';

import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { BLOCKING_RESERVATION_STATUSES } from '@/features/reservations/server/reservation-blocking';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { getRestaurantIanaZoneById } from '@/features/reservations/server/restaurant-timezone.repository';
import {
  buildReservationTimeSlots,
  type WorkingHoursLike,
} from '@/features/reservations/lib/booking-datetime-ui';
import { RESERVATION_DURATION_MINUTES } from '@/features/reservations/reservation-window';

const SLOT_STEP_MINUTES = 15;

export type SlotOccupancyTier = 'quiet' | 'moderate' | 'busy';

export type SlotOccupancyHint = {
  time: string;
  load: number;
  loadAdjusted: number;
  tier: SlotOccupancyTier;
};

function tierFromLoad(load: number): SlotOccupancyTier {
  if (load < 0.34) return 'quiet';
  if (load < 0.67) return 'moderate';
  return 'busy';
}

/**
 * Peaks on Fri/Sat/Sun evenings — display-only bump for the heuristic (not blocking logic).
 */
function weekendEveningBonus(input: {
  wallHour: number;
  wallMinute: number;
  dowLuxonMod7: number;
}): number {
  const { wallHour, wallMinute, dowLuxonMod7 } = input;
  const fri = 5;
  const sat = 6;
  const sun = 0;
  const isWeekendEvening =
    (dowLuxonMod7 === fri || dowLuxonMod7 === sat || dowLuxonMod7 === sun) &&
    (wallHour >= 18 || (wallHour === 17 && wallMinute >= 30));
  return isWeekendEvening ? 0.18 : 0;
}

export async function getSlotOccupancyHints(input: {
  restaurantId: string;
  date: string;
  workingHours: WorkingHoursLike[];
}): Promise<{
  hints: SlotOccupancyHint[];
  activeTablesCount: number;
  slotStepMinutes: number;
}> {
  const { restaurantId, date, workingHours } = input;

  const timeZone = await getRestaurantIanaZoneById(restaurantId);

  const [activeTablesCount, blockingCounts] = await Promise.all([
    prisma.restaurantTable.count({
      where: { restaurantId, isActive: true },
    }),
    buildBlockingCountsBySlot({
      restaurantId,
      date,
      timeZone,
      workingHours,
    }),
  ]);

  const hints: SlotOccupancyHint[] = blockingCounts.map(({ time, countBookings, wall }) => {
    const denom = Math.max(1, activeTablesCount);
    const load = Math.min(1, countBookings / denom);
    const bonus = weekendEveningBonus({
      wallHour: wall.hour,
      wallMinute: wall.minute,
      dowLuxonMod7: wall.weekday % 7,
    });
    const loadAdjusted = Math.min(1, load + bonus);
    return {
      time,
      load,
      loadAdjusted,
      tier: tierFromLoad(loadAdjusted),
    };
  });

  return {
    hints,
    activeTablesCount,
    slotStepMinutes: SLOT_STEP_MINUTES,
  };
}

function overlapsSlot(
  r: { startAt: Date; endAt: Date },
  slotStart: Date,
  slotEnd: Date,
  now: Date,
): boolean {
  if (!(r.endAt > now)) return false;
  return r.startAt < slotEnd && r.endAt > slotStart;
}

async function buildBlockingCountsBySlot(input: {
  restaurantId: string;
  date: string;
  timeZone: string;
  workingHours: WorkingHoursLike[];
}): Promise<{ time: string; countBookings: number; wall: DateTime }[]> {
  const { restaurantId, date, timeZone, workingHours } = input;

  const slotResult = buildReservationTimeSlots({
    isoDate: date,
    timeZone,
    workingHours,
    slotStepMinutes: SLOT_STEP_MINUTES,
    reservationDurationMinutes: RESERVATION_DURATION_MINUTES,
    notBeforeInZone: null,
  });

  const slots = slotResult.slots;
  if (!slots.length) return [];

  const dayWallStart = DateTime.fromISO(date, { zone: timeZone }).startOf('day');
  const dayWallEnd = dayWallStart.endOf('day');
  const dayStartUtc = dayWallStart.toUTC().toJSDate();
  const dayEndUtc = dayWallEnd.toUTC().toJSDate();
  const now = new Date();

  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      status: { in: [...BLOCKING_RESERVATION_STATUSES] },
      AND: [{ startAt: { lt: dayEndUtc } }, { endAt: { gt: dayStartUtc } }],
    },
    select: { startAt: true, endAt: true },
  });

  const results: { time: string; countBookings: number; wall: DateTime }[] = [];

  for (const time of slots) {
    const { startAt, endAt } = computeReservationWindow({ date, time, timeZone });
    const wall = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);

    const countBookings = reservations.filter((r) =>
      overlapsSlot(r, startAt, endAt, now),
    ).length;

    results.push({ time, countBookings, wall });
  }

  return results;
}
