import { DateTime } from 'luxon';

export type WorkingHoursLike = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

const HH_MM_RE = /^(\d{1,2}):(\d{2})$/;

function parseHHmmToMinutes(value: string): number | null {
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

export function ymdInZone(timeZone: string, dt: DateTime = DateTime.now().setZone(timeZone)): string {
  return dt.toFormat('yyyy-LL-dd');
}

/**
 * Rounded-up "now" in zone for filtering past slots on the selected calendar day.
 */
export function minBookableDateTimeInZone(
  timeZone: string,
  leadMinutes: number,
): DateTime {
  return DateTime.now().setZone(timeZone).plus({ minutes: leadMinutes });
}

export type SlotGenerationResult = {
  slots: string[];
  dayClosed: boolean;
  scheduleMissing: boolean;
  /**
   * The day's shift is effectively 24/7 (>= 22 hours long). Rendering a dropdown
   * of 80+ slots is poor UX, so the caller should default to a manual time input.
   */
  manualOnly: boolean;
};

const FALLBACK_OPEN = 10 * 60;
const FALLBACK_CLOSE = 23 * 60 + 30;
const MANUAL_ONLY_SHIFT_MIN = 22 * 60;

function shiftDuration(openMin: number, closeMin: number): number {
  return closeMin <= openMin ? closeMin + 24 * 60 - openMin : closeMin - openMin;
}

/**
 * Wall-clock HH:mm slots in `timeZone` for `isoDate`, aligned with reservation duration on server.
 *
 * Two shifts can contribute slots to a given calendar day:
 * 1. `isoDate`'s own shift — may extend past midnight (overnight).
 * 2. The previous day's overnight tail — shows as early-morning slots on `isoDate`.
 *
 * @param reservationDurationMinutes — must match `RESERVATION_DURATION_MINUTES`
 */
export function buildReservationTimeSlots(input: {
  isoDate: string;
  timeZone: string;
  workingHours: WorkingHoursLike[];
  slotStepMinutes: number;
  reservationDurationMinutes: number;
  /** Hide slots that start before this instant (same TZ awareness via wall comparison). */
  notBeforeInZone?: DateTime | null;
}): SlotGenerationResult {
  const {
    isoDate,
    timeZone,
    workingHours,
    slotStepMinutes,
    reservationDurationMinutes,
    notBeforeInZone,
  } = input;

  const dayStart = DateTime.fromISO(isoDate, { zone: timeZone });
  if (!dayStart.isValid) {
    return { slots: [], dayClosed: false, scheduleMissing: true, manualOnly: false };
  }

  const dow = dayStart.weekday % 7;
  const yDow = (dow + 6) % 7;
  const rowToday = workingHours.find((w) => w.dayOfWeek === dow);
  const rowYesterday = workingHours.find((w) => w.dayOfWeek === yDow);

  if (!rowToday && !rowYesterday) {
    const slots = collectSameDayStartSlots({
      dayStart,
      openMinutes: FALLBACK_OPEN,
      closeMinutes: FALLBACK_CLOSE,
      slotStepMinutes,
      reservationDurationMinutes,
      notBeforeInZone,
    });
    return { slots, dayClosed: false, scheduleMissing: true, manualOnly: false };
  }

  if (rowToday?.isClosed && !rowYesterday) {
    return { slots: [], dayClosed: true, scheduleMissing: false, manualOnly: false };
  }

  let manualOnly = false;
  const collected = new Set<string>();

  // Today's shift (same-day or overnight). Produces slots whose START falls on `isoDate`.
  if (rowToday && !rowToday.isClosed) {
    const openM = parseHHmmToMinutes(rowToday.openTime);
    const closeM = parseHHmmToMinutes(rowToday.closeTime);
    if (openM !== null && closeM !== null) {
      if (shiftDuration(openM, closeM) >= MANUAL_ONLY_SHIFT_MIN) {
        manualOnly = true;
      } else {
        for (const label of collectSameDayStartSlots({
          dayStart,
          openMinutes: openM,
          closeMinutes: closeM,
          slotStepMinutes,
          reservationDurationMinutes,
          notBeforeInZone,
        })) {
          collected.add(label);
        }
      }
    }
  }

  // Yesterday's overnight tail — shows slots on `isoDate` starting from 00:00.
  if (rowYesterday && !rowYesterday.isClosed && !manualOnly) {
    const openM = parseHHmmToMinutes(rowYesterday.openTime);
    const closeM = parseHHmmToMinutes(rowYesterday.closeTime);
    if (openM !== null && closeM !== null && closeM <= openM) {
      const lastStart = closeM - reservationDurationMinutes;
      for (let m = 0; m <= lastStart; m += slotStepMinutes) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const slotWall = dayStart.set({ hour: h, minute: min, second: 0, millisecond: 0 });
        if (notBeforeInZone && slotWall < notBeforeInZone) continue;
        collected.add(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }
  }

  if (manualOnly) {
    return { slots: [], dayClosed: false, scheduleMissing: false, manualOnly: true };
  }

  const slots = [...collected].sort();
  return { slots, dayClosed: false, scheduleMissing: false, manualOnly: false };
}

function collectSameDayStartSlots(input: {
  dayStart: DateTime;
  openMinutes: number;
  closeMinutes: number;
  slotStepMinutes: number;
  reservationDurationMinutes: number;
  notBeforeInZone?: DateTime | null;
}): string[] {
  const {
    dayStart,
    openMinutes,
    closeMinutes,
    slotStepMinutes,
    reservationDurationMinutes,
    notBeforeInZone,
  } = input;

  const isOvernight = closeMinutes <= openMinutes;
  const effectiveClose = isOvernight ? closeMinutes + 24 * 60 : closeMinutes;
  const lastStartMinutes = effectiveClose - reservationDurationMinutes;
  if (lastStartMinutes < openMinutes) {
    return [];
  }

  // Only produce slots whose wall-clock start falls within `dayStart`'s own date
  // (< 24h). Slots after midnight belong to the next calendar day and should be
  // rendered under that date via the "yesterday's overnight tail" branch.
  const hardStop = Math.min(lastStartMinutes, 24 * 60 - 1);

  const slots: string[] = [];
  for (let m = openMinutes; m <= hardStop; m += slotStepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const slotWall = dayStart.set({ hour: h, minute: min, second: 0, millisecond: 0 });
    if (notBeforeInZone && slotWall < notBeforeInZone) continue;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}
