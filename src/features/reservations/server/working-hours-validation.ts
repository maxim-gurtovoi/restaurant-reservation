import 'server-only';

import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';

/** Machine-readable codes for API / UI (domain validation, not generic failures). */
export const WORKING_HOURS_ERROR_CODES = {
  NO_WORKING_HOURS_FOR_DAY: 'NO_WORKING_HOURS_FOR_DAY',
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  OUTSIDE_WORKING_HOURS: 'OUTSIDE_WORKING_HOURS',
  WORKING_HOURS_MISCONFIGURED: 'WORKING_HOURS_MISCONFIGURED',
  INVALID_TIME_WINDOW: 'INVALID_TIME_WINDOW',
} as const;

export type WorkingHoursErrorCode =
  (typeof WORKING_HOURS_ERROR_CODES)[keyof typeof WORKING_HOURS_ERROR_CODES];

/** Shape needed for validation (matches Prisma WorkingHours fields used in rules). */
export type WorkingHoursScheduleRow = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

export type WorkingHoursValidationResult =
  | { valid: true }
  | { valid: false; code: WorkingHoursErrorCode; message: string };

const HH_MM_RE = /^(\d{1,2}):(\d{2})$/;

function tryParseHHmmToMinutes(value: string): number | null {
  const m = value.trim().match(HH_MM_RE);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Build the [open, close] window in the given IANA zone, anchored on `anchorDate`.
 * If the schedule is overnight (close <= open) the close side rolls into the
 * next calendar day — otherwise it stays on the same day as `anchorDate`.
 */
function buildShiftWindow(
  anchorDate: DateTime,
  openMinutes: number,
  closeMinutes: number,
  timeZone: string,
): { openDate: Date; closeDate: Date; isOvernight: boolean } {
  const isOvernight = closeMinutes <= openMinutes;
  const openWall = DateTime.fromObject(
    {
      year: anchorDate.year,
      month: anchorDate.month,
      day: anchorDate.day,
      hour: Math.floor(openMinutes / 60),
      minute: openMinutes % 60,
      second: 0,
      millisecond: 0,
    },
    { zone: timeZone },
  );
  let closeWall = DateTime.fromObject(
    {
      year: anchorDate.year,
      month: anchorDate.month,
      day: anchorDate.day,
      hour: Math.floor(closeMinutes / 60),
      minute: closeMinutes % 60,
      second: 0,
      millisecond: 0,
    },
    { zone: timeZone },
  );
  if (isOvernight) {
    closeWall = closeWall.plus({ days: 1 });
  }
  return {
    openDate: openWall.toUTC().toJSDate(),
    closeDate: closeWall.toUTC().toJSDate(),
    isOvernight,
  };
}

/**
 * Pure working-hours check in a fixed IANA zone.
 *
 * The reservation must lie fully inside some working shift. Two shifts are
 * considered: the one starting on the calendar day of `startAt` (in the zone)
 * and, if that day's predecessor is overnight (close <= open), its tail that
 * extends past midnight. `dayOfWeek` matches JS: 0 = Sunday … 6 = Saturday.
 */
export function validateReservationAgainstWorkingHours(input: {
  workingHours: WorkingHoursScheduleRow[];
  startAt: Date;
  endAt: Date;
  timeZone: string;
}): WorkingHoursValidationResult {
  const { workingHours, startAt, endAt, timeZone } = input;

  if (!(endAt > startAt)) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.INVALID_TIME_WINDOW,
      message: 'Некорректный интервал бронирования.',
    };
  }

  const startWall = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);
  const todayDow = startWall.weekday % 7;
  const yesterdayDow = (todayDow + 6) % 7;

  const todaySchedule = workingHours.find((wh) => wh.dayOfWeek === todayDow);
  const yesterdaySchedule = workingHours.find((wh) => wh.dayOfWeek === yesterdayDow);

  // Try to fit the reservation into today's shift first (same-day or overnight).
  if (todaySchedule && !todaySchedule.isClosed) {
    const openM = tryParseHHmmToMinutes(todaySchedule.openTime);
    const closeM = tryParseHHmmToMinutes(todaySchedule.closeTime);
    if (openM === null || closeM === null) {
      return {
        valid: false,
        code: WORKING_HOURS_ERROR_CODES.WORKING_HOURS_MISCONFIGURED,
        message: 'Время работы ресторана задано некорректно.',
      };
    }
    const { openDate, closeDate } = buildShiftWindow(startWall, openM, closeM, timeZone);
    if (startAt >= openDate && endAt <= closeDate) {
      return { valid: true };
    }
  }

  // Otherwise the reservation might fall into the tail of yesterday's overnight shift.
  if (yesterdaySchedule && !yesterdaySchedule.isClosed) {
    const openM = tryParseHHmmToMinutes(yesterdaySchedule.openTime);
    const closeM = tryParseHHmmToMinutes(yesterdaySchedule.closeTime);
    if (openM !== null && closeM !== null && closeM <= openM) {
      const yAnchor = startWall.minus({ days: 1 });
      const { openDate, closeDate } = buildShiftWindow(yAnchor, openM, closeM, timeZone);
      if (startAt >= openDate && endAt <= closeDate) {
        return { valid: true };
      }
    }
  }

  // Nothing fits — pick the most informative error based on today's schedule.
  if (!todaySchedule) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY,
      message: 'На этот день не задано время работы; бронирование недоступно.',
    };
  }
  if (todaySchedule.isClosed) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED,
      message: 'В этот день ресторан закрыт.',
    };
  }
  return {
    valid: false,
    code: WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS,
    message: 'Выбранное время выходит за пределы часов работы ресторана.',
  };
}

/** Thrown when working-hours domain rules fail; carries a stable API code. */
export class WorkingHoursDomainError extends Error {
  readonly code: WorkingHoursErrorCode;

  constructor(code: WorkingHoursErrorCode, message: string) {
    super(message);
    this.name = 'WorkingHoursDomainError';
    this.code = code;
  }
}

/**
 * Loads WorkingHours and applies the same validation as availability/create.
 * Pass `timeZone` when it was already fetched upstream to avoid an extra DB round-trip.
 */
export async function ensureWorkingHoursAllowReservation(input: {
  restaurantId: string;
  startAt: Date;
  endAt: Date;
  /** Pre-resolved IANA zone — skips the restaurant SELECT when provided. */
  timeZone?: string;
}): Promise<void> {
  const [rows, restaurant] = await Promise.all([
    prisma.workingHours.findMany({
      where: { restaurantId: input.restaurantId },
      select: {
        dayOfWeek: true,
        isClosed: true,
        openTime: true,
        closeTime: true,
      },
    }),
    input.timeZone
      ? Promise.resolve(null)
      : prisma.restaurant.findUnique({
          where: { id: input.restaurantId },
          select: { timeZone: true },
        }),
  ]);

  const timeZone = input.timeZone ?? getRestaurantIanaZone(restaurant ?? { timeZone: null });

  const result = validateReservationAgainstWorkingHours({
    workingHours: rows,
    startAt: input.startAt,
    endAt: input.endAt,
    timeZone,
  });

  if (!result.valid) {
    throw new WorkingHoursDomainError(result.code, result.message);
  }
}
