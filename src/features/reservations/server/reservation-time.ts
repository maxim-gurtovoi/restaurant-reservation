import 'server-only';

export const RESERVATION_DURATION_MINUTES = 90;

export function computeReservationWindow(input: {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}): { startAt: Date; endAt: Date } {
  const { date, time } = input;

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

  const startAt = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(startAt.getTime())) {
    throw new Error('Invalid date or time');
  }

  const endAt = new Date(
    startAt.getTime() + RESERVATION_DURATION_MINUTES * 60 * 1000,
  );

  return { startAt, endAt };
}

