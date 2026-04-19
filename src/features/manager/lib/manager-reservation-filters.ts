export type StatusFilter =
  | 'all'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type TimeFilter = 'all' | 'today' | 'upcoming' | 'past';

const STATUS_VALUES: StatusFilter[] = [
  'all',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const TIME_VALUES: TimeFilter[] = ['all', 'today', 'upcoming', 'past'];

export function parseStatusFilterParam(value: string | undefined): StatusFilter {
  return value && STATUS_VALUES.includes(value as StatusFilter) ? (value as StatusFilter) : 'all';
}

export function parseTimeFilterParam(value: string | undefined): TimeFilter {
  return value && TIME_VALUES.includes(value as TimeFilter) ? (value as TimeFilter) : 'all';
}

/** Summary strip for manager reservations (local “today” in app default TZ). */
export type ManagerTodaySummary = {
  confirmed: number;
  checkedIn: number;
  completed: number;
  noShow: number;
};
