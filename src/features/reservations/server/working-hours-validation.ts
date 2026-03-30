import 'server-only';

import { prisma } from '@/lib/prisma';

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

function localDateAtMinutes(
  year: number,
  monthIndex: number,
  dayOfMonth: number,
  minutesFromMidnight: number,
): Date {
  const h = Math.floor(minutesFromMidnight / 60);
  const min = minutesFromMidnight % 60;
  return new Date(year, monthIndex, dayOfMonth, h, min, 0, 0);
}

/**
 * Pure working-hours check: uses Date.getDay() on startAt (0 = Sunday … 6 = Saturday).
 * Reservation must be half-open [startAt, endAt) fully inside half-open [openDate, closeDate)
 * on startAt's local calendar day. No Prisma / restaurantId — pass all rows for the restaurant.
 */
export function validateReservationAgainstWorkingHours(input: {
  workingHours: WorkingHoursScheduleRow[];
  startAt: Date;
  endAt: Date;
}): WorkingHoursValidationResult {
  const { workingHours, startAt, endAt } = input;

  if (!(endAt > startAt)) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.INVALID_TIME_WINDOW,
      message: 'Invalid reservation time window.',
    };
  }

  const dayOfWeek = startAt.getDay();
  const schedule = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

  if (!schedule) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY,
      message: 'No working hours are configured for this day; booking is not available.',
    };
  }

  if (schedule.isClosed) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED,
      message: 'Restaurant is closed on this day.',
    };
  }

  const openMinutes = tryParseHHmmToMinutes(schedule.openTime);
  const closeMinutes = tryParseHHmmToMinutes(schedule.closeTime);
  if (openMinutes === null || closeMinutes === null) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.WORKING_HOURS_MISCONFIGURED,
      message: 'Restaurant working hours are misconfigured.',
    };
  }

  if (closeMinutes <= openMinutes) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.OVERNIGHT_NOT_SUPPORTED,
      message: 'Overnight working hours are not supported for this restaurant.',
    };
  }

  const y = startAt.getFullYear();
  const mo = startAt.getMonth();
  const d = startAt.getDate();
  const openDate = localDateAtMinutes(y, mo, d, openMinutes);
  const closeDate = localDateAtMinutes(y, mo, d, closeMinutes);

  if (startAt < openDate || endAt > closeDate) {
    return {
      valid: false,
      code: WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS,
      message: 'Requested reservation time is outside restaurant working hours.',
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
 * Loads all WorkingHours for the restaurant and applies the same validation as availability/create.
 * Single integration point so rule logic is not duplicated across flows.
 */
export async function ensureWorkingHoursAllowReservation(input: {
  restaurantId: string;
  startAt: Date;
  endAt: Date;
}): Promise<void> {
  const rows = await prisma.workingHours.findMany({
    where: { restaurantId: input.restaurantId },
    select: {
      dayOfWeek: true,
      isClosed: true,
      openTime: true,
      closeTime: true,
    },
  });

  const result = validateReservationAgainstWorkingHours({
    workingHours: rows,
    startAt: input.startAt,
    endAt: input.endAt,
  });

  if (!result.valid) {
    throw new WorkingHoursDomainError(result.code, result.message);
  }
}
