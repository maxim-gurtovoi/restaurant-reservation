'use client';

import Link from 'next/link';
import type { StatusFilter, TimeFilter } from '@/features/admin/lib/admin-reservation-filters';

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'Все даты' },
  { id: 'today', label: 'Сегодня' },
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Все статусы' },
  { id: 'CONFIRMED', label: 'Подтверждено' },
  { id: 'CHECKED_IN', label: 'Посетили' },
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
};

export function AdminReservationsFilterBar({ timeFilter, statusFilter }: Props) {
  function hrefFor(partial: { status?: StatusFilter; time?: TimeFilter }): string {
    const params = new URLSearchParams();
    const nextStatus = partial.status ?? statusFilter;
    const nextTime = partial.time ?? timeFilter;
    if (nextStatus !== 'all') params.set('status', nextStatus);
    if (nextTime !== 'all') params.set('time', nextTime);
    params.set('page', '1');
    const q = params.toString();
    return q ? `/admin/reservations?${q}` : '/admin/reservations?page=1';
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Когда</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по дате">
          {TIME_OPTIONS.map(({ id, label }) => (
            <Link
              key={id}
              role="tab"
              aria-selected={timeFilter === id}
              href={hrefFor({ time: id })}
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${pillClass(timeFilter === id)}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">Статус</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по статусу">
          {STATUS_OPTIONS.map(({ id, label }) => (
            <Link
              key={id}
              role="tab"
              aria-selected={statusFilter === id}
              href={hrefFor({ status: id })}
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${pillClass(statusFilter === id)}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
