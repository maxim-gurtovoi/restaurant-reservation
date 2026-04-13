import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';

export type StatusFilter =
  | 'all'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type TimeFilter = 'all' | 'today' | 'upcoming' | 'past';

export type TodaySummary = {
  confirmed: number;
  checkedIn: number;
  completed: number;
  noShow: number;
};

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfNextLocalDay(d: Date): Date {
  const x = startOfLocalDay(d);
  x.setDate(x.getDate() + 1);
  return x;
}

function isStartOnLocalDay(iso: string, dayStart: Date, nextDayStart: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= dayStart.getTime() && t < nextDayStart.getTime();
}

function matchesStatus(r: ManagerReservationListItem, status: StatusFilter): boolean {
  if (status === 'all') return true;
  return r.status === status;
}

function matchesTime(r: ManagerReservationListItem, time: TimeFilter): boolean {
  if (time === 'all') return true;

  const now = new Date();
  const start = new Date(r.startAt);
  const end = new Date(r.endAt);
  const startToday = startOfLocalDay(now);
  const startTomorrow = startOfNextLocalDay(now);

  if (time === 'today') {
    return isStartOnLocalDay(r.startAt, startToday, startTomorrow);
  }

  if (time === 'upcoming') {
    return start.getTime() >= startTomorrow.getTime();
  }

  // past: ended before now, or started before today (historical rows)
  if (time === 'past') {
    return end.getTime() < now.getTime() || start.getTime() < startToday.getTime();
  }

  return true;
}

export function filterManagerReservations(
  items: ManagerReservationListItem[],
  status: StatusFilter,
  time: TimeFilter,
): ManagerReservationListItem[] {
  return items.filter((r) => matchesStatus(r, status) && matchesTime(r, time));
}

/** Counts for reservations “today” (local calendar), for the summary strip. */
export function computeTodaySummary(items: ManagerReservationListItem[]): TodaySummary {
  const now = new Date();
  const startToday = startOfLocalDay(now);
  const startTomorrow = startOfNextLocalDay(now);

  let confirmed = 0;
  let checkedIn = 0;
  let completed = 0;
  let noShow = 0;

  for (const r of items) {
    const startTodaySlot = isStartOnLocalDay(r.startAt, startToday, startTomorrow);

    if (r.status === 'CONFIRMED' && startTodaySlot) confirmed += 1;
    if (r.status === 'COMPLETED' && startTodaySlot) completed += 1;
    if (r.status === 'NO_SHOW' && startTodaySlot) noShow += 1;

    if (r.status === 'CHECKED_IN' && r.checkedInAt) {
      if (isStartOnLocalDay(r.checkedInAt, startToday, startTomorrow)) checkedIn += 1;
    }
  }

  return { confirmed, checkedIn, completed, noShow };
}
