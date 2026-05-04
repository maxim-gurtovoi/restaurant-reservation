import { DateTime } from 'luxon';
import {
  WORKING_HOURS_ERROR_CODES,
  validateReservationAgainstWorkingHours,
} from '@/features/reservations/server/working-hours-validation';

export type WorkingHoursItem = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type OpenStatusTone = 'open' | 'closed' | 'unknown';

export type OpenStatus = {
  tone: OpenStatusTone;
  label: string;
};

export type WeeklyRow = {
  dayOfWeek: number;
  label: string;
  isToday: boolean;
  value: string;
  isEmphasized: boolean;
};

export type OpenStatusLabels = {
  open: string;
  closed: string;
  unknown: string;
  dayOff: string;
  unavailable: string;
  /** Shown for 24h shifts (e.g. open == close). */
  allDay: string;
  /** Labels keyed by dayOfWeek (0 = Sunday … 6 = Saturday). */
  dayNames: Record<number, string>;
};

function parseHHmmToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
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

function formatWorkingHoursValue(
  item: WorkingHoursItem | undefined,
  labels: OpenStatusLabels,
): { text: string; emphasized: boolean } {
  if (!item || item.isClosed) {
    return { text: labels.dayOff, emphasized: false };
  }

  const openMins = parseHHmmToMinutes(item.openTime);
  const closeMins = parseHHmmToMinutes(item.closeTime);
  if (openMins === null || closeMins === null) {
    return { text: labels.unavailable, emphasized: false };
  }

  // open == close is our convention for "open around the clock" (full 24h shift).
  if (closeMins === openMins) {
    return { text: labels.allDay, emphasized: true };
  }

  // If close < open, the shift runs past midnight — show the full range as-is;
  // the "next day" context is conveyed visually by the closing time being earlier.
  return { text: `${item.openTime} – ${item.closeTime}`, emphasized: true };
}

export function buildWeeklyRows(
  workingHours: WorkingHoursItem[],
  timeZone: string,
  labels: OpenStatusLabels,
): WeeklyRow[] {
  const today = DateTime.now().setZone(timeZone).weekday % 7;
  const byDay = new Map(workingHours.map((item) => [item.dayOfWeek, item]));

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const item = byDay.get(dayOfWeek);
    const value = formatWorkingHoursValue(item, labels);
    return {
      dayOfWeek,
      label: labels.dayNames[dayOfWeek] ?? `Day ${dayOfWeek}`,
      isToday: dayOfWeek === today,
      value: value.text,
      isEmphasized: value.emphasized,
    };
  });
}

export function getOpenStatus(
  workingHours: WorkingHoursItem[],
  timeZone: string,
  labels: OpenStatusLabels,
): OpenStatus {
  const now = new Date();
  const minuteLater = new Date(now.getTime() + 60 * 1000);
  const result = validateReservationAgainstWorkingHours({
    workingHours,
    startAt: now,
    endAt: minuteLater,
    timeZone,
  });

  if (result.valid) {
    return { tone: 'open', label: labels.open };
  }

  if (
    result.code === WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY ||
    result.code === WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED ||
    result.code === WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS
  ) {
    return { tone: 'closed', label: labels.closed };
  }

  return { tone: 'unknown', label: labels.unknown };
}
