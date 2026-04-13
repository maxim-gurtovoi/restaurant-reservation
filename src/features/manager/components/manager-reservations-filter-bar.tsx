'use client';

import type { StatusFilter, TimeFilter } from '@/features/manager/lib/manager-reservations-filter-utils';

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'Все даты' },
  { id: 'today', label: 'Сегодня' },
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Все статусы' },
  { id: 'CONFIRMED', label: 'Подтверждено' },
  { id: 'CHECKED_IN', label: 'Заселение' },
  { id: 'COMPLETED', label: 'Завершено' },
  { id: 'CANCELLED', label: 'Отменено' },
  { id: 'NO_SHOW', label: 'Неявка' },
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
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Когда</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по дате">
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
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Статус</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по статусу">
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
