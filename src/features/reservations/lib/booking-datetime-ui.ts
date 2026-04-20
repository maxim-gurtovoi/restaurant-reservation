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
};

const FALLBACK_OPEN = 10 * 60;
const FALLBACK_CLOSE = 23 * 60 + 30;

/**
 * Wall-clock HH:mm slots in `timeZone` for `isoDate`, aligned with reservation duration on server.
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
    return { slots: [], dayClosed: false, scheduleMissing: true };
  }

  const dow = dayStart.weekday % 7;
  const row = workingHours.find((w) => w.dayOfWeek === dow);

  if (!row) {
    const slots = buildSlotsForOpenCloseMinutes({
      dayStart,
      openMinutes: FALLBACK_OPEN,
      closeMinutes: FALLBACK_CLOSE,
      slotStepMinutes,
      reservationDurationMinutes,
      notBeforeInZone,
    });
    return { slots, dayClosed: false, scheduleMissing: true };
  }

  if (row.isClosed) {
    return { slots: [], dayClosed: true, scheduleMissing: false };
  }

  const openMinutes = parseHHmmToMinutes(row.openTime);
  const closeMinutes = parseHHmmToMinutes(row.closeTime);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return { slots: [], dayClosed: false, scheduleMissing: true };
  }

  const slots = buildSlotsForOpenCloseMinutes({
    dayStart,
    openMinutes,
    closeMinutes,
    slotStepMinutes,
    reservationDurationMinutes,
    notBeforeInZone,
  });

  return { slots, dayClosed: false, scheduleMissing: false };
}

function buildSlotsForOpenCloseMinutes(input: {
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

  const lastStartMinutes = closeMinutes - reservationDurationMinutes;
  if (lastStartMinutes < openMinutes) {
    return [];
  }

  const slots: string[] = [];
  for (let m = openMinutes; m <= lastStartMinutes; m += slotStepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const slotWall = dayStart.set({ hour: h, minute: min, second: 0, millisecond: 0 });
    if (notBeforeInZone && slotWall < notBeforeInZone) {
      continue;
    }
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}
