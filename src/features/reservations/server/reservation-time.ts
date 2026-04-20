import 'server-only';

import { DateTime } from 'luxon';
import { RESERVATION_DURATION_MINUTES } from '@/features/reservations/reservation-window';

/**
 * Interprets calendar date + wall-clock time in the given IANA zone and returns UTC instants.
 */
export function computeReservationWindow(input: {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timeZone: string;
}): { startAt: Date; endAt: Date } {
  const { date, time, timeZone } = input;

  const dateParts = date.split('-');
  const timeParts = time.split(':');
  if (dateParts.length !== 3 || timeParts.length !== 2) {
    throw new Error('Invalid date or time format');
  }

  const [year, month, day] = dateParts.map((n) => Number(n));
  const [hours, minutes] = timeParts.map((n) => Number(n));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    throw new Error('Invalid date or time value');
  }

  const startWall = DateTime.fromObject(
    { year, month, day, hour: hours, minute: minutes, second: 0, millisecond: 0 },
    { zone: timeZone },
  );

  if (!startWall.isValid) {
    throw new Error('Invalid date or time');
  }

  const startAt = startWall.toUTC().toJSDate();
  const endAt = startWall.plus({ minutes: RESERVATION_DURATION_MINUTES }).toUTC().toJSDate();

  return { startAt, endAt };
}
