import 'server-only';

import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';

/** Machine-readable codes for API / UI (domain validation, not generic failures). */
export const WORKING_HOURS_ERROR_CODES = {
  NO_WORKING_HOURS_FOR_DAY: 'NO_WORKING_HOURS_FOR_DAY',
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  OUTSIDE_WORKING_HOURS: 'OUTSIDE_WORKING_HOURS',
  OVERNIGHT_NOT_SUPPORTED: 'OVERNIGHT_NOT_SUPPORTED',
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

/** JS getDay(): 0 Sunday … 6 Saturday — same convention as Prisma seed `dayOfWeek`. */
function jsDayOfWeekInZone(startAt: Date, timeZone: string): number {
  const wall = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);
  return wall.weekday % 7;
}

/**
 * Pure working-hours check in a fixed IANA zone.
 * Reservation must lie fully inside [open, close] on the calendar day of `startAt` in that zone.
 * `dayOfWeek` on schedule rows matches JS: 0 = Sunday … 6 = Saturday.
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

  const dayOfWeek = jsDayOfWeekInZone(startAt, timeZone);
  const schedule = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

  if (!schedule) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY,
      message: 'На этот день не задано время работы; бронирование недоступно.',
    };
  }

  if (schedule.isClosed) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED,
      message: 'В этот день ресторан закрыт.',
    };
  }

  const openMinutes = tryParseHHmmToMinutes(schedule.openTime);
  const closeMinutes = tryParseHHmmToMinutes(schedule.closeTime);
  if (openMinutes === null || closeMinutes === null) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.WORKING_HOURS_MISCONFIGURED,
      message: 'Время работы ресторана задано некорректно.',
    };
  }

  if (closeMinutes <= openMinutes) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.OVERNIGHT_NOT_SUPPORTED,
      message: 'Сквозное время работы (через полночь) для этого ресторана не поддерживается.',
    };
  }

  const startWall = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);
  const openH = Math.floor(openMinutes / 60);
  const openM = openMinutes % 60;
  const closeH = Math.floor(closeMinutes / 60);
  const closeM = closeMinutes % 60;

  const openWall = DateTime.fromObject(
    {
      year: startWall.year,
      month: startWall.month,
      day: startWall.day,
      hour: openH,
      minute: openM,
      second: 0,
      millisecond: 0,
    },
    { zone: timeZone },
  );
  const closeWall = DateTime.fromObject(
    {
      year: startWall.year,
      month: startWall.month,
      day: startWall.day,
      hour: closeH,
      minute: closeM,
      second: 0,
      millisecond: 0,
    },
    { zone: timeZone },
  );

  const openDate = openWall.toUTC().toJSDate();
  const closeDate = closeWall.toUTC().toJSDate();

  if (startAt < openDate || endAt > closeDate) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS,
      message: 'Выбранное время выходит за пределы часов работы ресторана.',
    };
  }

  return { valid: true };
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
 * Loads WorkingHours + restaurant TZ and applies the same validation as availability/create.
 */
export async function ensureWorkingHoursAllowReservation(input: {
  restaurantId: string;
  startAt: Date;
  endAt: Date;
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
    prisma.restaurant.findUnique({
      where: { id: input.restaurantId },
      select: { timeZone: true },
    }),
  ]);

  const timeZone = getRestaurantIanaZone(restaurant ?? { timeZone: null });

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
