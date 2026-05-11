import { DateTime } from 'luxon';
import { BOOKING_LEAD_MINUTES } from '@/features/reservations/reservation-window';

export type BlockedRecurrenceRow = {
  dayOfWeek: number;
  startHHmm: string;
  endHHmm: string;
};

export const BOOKING_RULE_ERROR_CODES = {
  BOOKING_LEAD_TOO_SHORT: 'BOOKING_LEAD_TOO_SHORT',
  RESERVATION_IN_BLOCKED_WINDOW: 'RESERVATION_IN_BLOCKED_WINDOW',
  PHONE_REQUIRED_LARGE_PARTY: 'PHONE_REQUIRED_LARGE_PARTY',
} as const;

export type BookingRuleErrorCode =
  (typeof BOOKING_RULE_ERROR_CODES)[keyof typeof BOOKING_RULE_ERROR_CODES];

export class BookingRulesDomainError extends Error {
  readonly code: BookingRuleErrorCode;

  constructor(code: BookingRuleErrorCode, message: string) {
    super(message);
    this.name = 'BookingRulesDomainError';
    this.code = code;
  }
}

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

/** Same convention as `WorkingHours.dayOfWeek`: Luxon weekday % 7 → Sun=0 … Sat=6 */
export function luxonDayOfWeekToSlotConvention(dt: DateTime): number {
  return dt.weekday % 7;
}

export function parseBlockedRecurrenceJson(
  raw: unknown,
): BlockedRecurrenceRow[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: BlockedRecurrenceRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const dayOfWeek = (row as { dayOfWeek?: unknown }).dayOfWeek;
    const startHHmm = (row as { startHHmm?: unknown }).startHHmm;
    const endHHmm = (row as { endHHmm?: unknown }).endHHmm;
    if (
      typeof dayOfWeek !== 'number' ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      typeof startHHmm !== 'string' ||
      typeof endHHmm !== 'string'
    ) {
      continue;
    }
    const sm = tryParseHHmmToMinutes(startHHmm);
    const em = tryParseHHmmToMinutes(endHHmm);
    if (sm === null || em === null || em <= sm) continue;
    out.push({ dayOfWeek, startHHmm, endHHmm });
  }
  return out;
}

export function getEffectiveLeadMinutes(minBookingLeadMinutes: number | null | undefined): number {
  if (
    minBookingLeadMinutes != null &&
    Number.isFinite(minBookingLeadMinutes) &&
    minBookingLeadMinutes >= 0
  ) {
    return Math.floor(minBookingLeadMinutes);
  }
  return BOOKING_LEAD_MINUTES;
}

/**
 * Whether [startAt, endAt] overlaps any recurring blocked window on the touched calendar days (in `timeZone`).
 */
export function reservationOverlapsBlockedRecurrence(input: {
  startAt: Date;
  endAt: Date;
  timeZone: string;
  blocks: BlockedRecurrenceRow[];
}): boolean {
  const { startAt, endAt, timeZone, blocks } = input;
  if (blocks.length === 0) return false;

  const startZ = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);
  const endZ = DateTime.fromJSDate(endAt, { zone: 'utc' }).setZone(timeZone);

  const daysToCheck: DateTime[] = [startZ.startOf('day')];
  if (!startZ.hasSame(endZ, 'day')) {
    daysToCheck.push(endZ.startOf('day'));
  }

  for (const dayStart of daysToCheck) {
    const dow = luxonDayOfWeekToSlotConvention(dayStart);
    for (const b of blocks) {
      if (b.dayOfWeek !== dow) continue;
      const sm = tryParseHHmmToMinutes(b.startHHmm);
      const em = tryParseHHmmToMinutes(b.endHHmm);
      if (sm === null || em === null || em <= sm) continue;

      const winOpen = dayStart.set({
        hour: Math.floor(sm / 60),
        minute: sm % 60,
        second: 0,
        millisecond: 0,
      });
      const winClose = dayStart.set({
        hour: Math.floor(em / 60),
        minute: em % 60,
        second: 0,
        millisecond: 0,
      });

      const o0 = winOpen.toUTC().toJSDate();
      const o1 = winClose.toUTC().toJSDate();
      if (startAt < o1 && endAt > o0) {
        return true;
      }
    }
  }

  return false;
}

export function assertBookingLeadAllowed(input: {
  startAt: Date;
  timeZone: string;
  leadMinutes: number;
}): void {
  const { startAt, timeZone, leadMinutes } = input;
  const earliest = DateTime.now().setZone(timeZone).plus({ minutes: leadMinutes });
  const resStart = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timeZone);
  if (resStart < earliest) {
    throw new BookingRulesDomainError(
      BOOKING_RULE_ERROR_CODES.BOOKING_LEAD_TOO_SHORT,
      `Бронь возможна не ранее чем за ${leadMinutes} минут до визита.`,
    );
  }
}

export function assertPhoneForLargeParty(input: {
  guestCount: number;
  contactPhone: string | null | undefined;
  maxGuestsWithoutPhone: number | null | undefined;
}): void {
  const max = input.maxGuestsWithoutPhone;
  if (max == null || !Number.isFinite(max)) return;
  const floorMax = Math.floor(max);
  if (floorMax < 1) return;
  if (input.guestCount <= floorMax) return;
  const phone = input.contactPhone?.trim();
  if (!phone) {
    throw new BookingRulesDomainError(
      BOOKING_RULE_ERROR_CODES.PHONE_REQUIRED_LARGE_PARTY,
      `Для компании свыше ${floorMax} гостей укажите номер телефона.`,
    );
  }
}

export function assertNotBlockedWindow(input: {
  startAt: Date;
  endAt: Date;
  timeZone: string;
  blocks: BlockedRecurrenceRow[];
}): void {
  if (
    reservationOverlapsBlockedRecurrence({
      startAt: input.startAt,
      endAt: input.endAt,
      timeZone: input.timeZone,
      blocks: input.blocks,
    })
  ) {
    throw new BookingRulesDomainError(
      BOOKING_RULE_ERROR_CODES.RESERVATION_IN_BLOCKED_WINDOW,
      'На это время онлайн-бронирование недоступно. Выберите другое время или свяжитесь с рестораном.',
    );
  }
}

/**
 * True if wall-clock start (HH:mm on `isoDate` in `timeZone`) falls inside a blocked window.
 */
export function isSlotStartBlocked(input: {
  isoDate: string;
  slotTimeHHmm: string;
  timeZone: string;
  blocks: BlockedRecurrenceRow[];
}): boolean {
  const { isoDate, slotTimeHHmm, timeZone, blocks } = input;
  if (blocks.length === 0) return false;

  const dayStart = DateTime.fromISO(isoDate, { zone: timeZone });
  if (!dayStart.isValid) return false;
  const dow = luxonDayOfWeekToSlotConvention(dayStart);

  const sm = tryParseHHmmToMinutes(slotTimeHHmm);
  if (sm === null) return false;

  for (const b of blocks) {
    if (b.dayOfWeek !== dow) continue;
    const openM = tryParseHHmmToMinutes(b.startHHmm);
    const closeM = tryParseHHmmToMinutes(b.endHHmm);
    if (openM === null || closeM === null || closeM <= openM) continue;
    const slotM = sm;
    if (slotM >= openM && slotM < closeM) {
      return true;
    }
  }

  return false;
}
