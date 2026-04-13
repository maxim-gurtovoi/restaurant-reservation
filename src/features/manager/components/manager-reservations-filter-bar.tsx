'use client';

import type { StatusFilter, TimeFilter } from '@/features/manager/lib/manager-reservations-filter-utils';

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'CHECKED_IN', label: 'Checked in' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'NO_SHOW', label: 'No-show' },
];

function pillClass(active: boolean) {
  return active
    ? 'border-primary bg-primary/10 text-primary shadow-sm'
    : 'border-border/60 bg-surface text-muted hover:border-border hover:text-foreground';
}

type Props = {
  timeFilter: TimeFilter;
  statusFilter: StatusFilter;
  onTimeChange: (t: TimeFilter) => void;
  onStatusChange: (s: StatusFilter) => void;
};

export function ManagerReservationsFilterBar({
  timeFilter,
  statusFilter,
  onTimeChange,
  onStatusChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">When</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by date">
          {TIME_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={timeFilter === id}
              onClick={() => onTimeChange(id)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${pillClass(timeFilter === id)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Status</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {STATUS_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={statusFilter === id}
              onClick={() => onStatusChange(id)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${pillClass(statusFilter === id)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
