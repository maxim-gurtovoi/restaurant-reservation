'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { AdminReservationListItem } from '@/features/admin/server/admin.service';
import type {
  AdminTodaySummary,
  StatusFilter,
  TimeFilter,
} from '@/features/admin/lib/admin-reservation-filters';
import { AdminReservationsFilterBar } from '@/features/admin/components/admin-reservations-filter-bar';
import { AdminReservationsList } from '@/features/admin/components/admin-reservations-list';
import { AdminReservationsSummary } from '@/features/admin/components/admin-reservations-summary';
import { AdminReservationsTimeline } from '@/features/admin/components/admin-reservations-timeline';

type ViewMode = 'list' | 'timeline';

export function AdminReservationsView({
  reservations,
  page,
  totalPages,
  total,
  statusFilter,
  timeFilter,
  todaySummary,
}: {
  reservations: AdminReservationListItem[];
  page: number;
  totalPages: number;
  total: number;
  statusFilter: StatusFilter;
  timeFilter: TimeFilter;
  todaySummary: AdminTodaySummary;
}) {
  const [mode, setMode] = useState<ViewMode>('list');

  const noMatches = total === 0;
  const noReservationsEver = noMatches && statusFilter === 'all' && timeFilter === 'all';

  if (noReservationsEver) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        <p className="text-sm text-foreground">Пока нет бронирований по вашим ресторанам.</p>
        <p className="mt-1 text-xs text-muted">
          Когда гости начнут бронировать, записи появятся здесь.
        </p>
      </Card>
    );
  }

  if (noMatches) {
    return (
      <div className="space-y-4">
        <AdminReservationsSummary summary={todaySummary} />
        <AdminReservationsFilterBar statusFilter={statusFilter} timeFilter={timeFilter} />
        <Card className="border-dashed border-border/50 bg-surface">
          <p className="text-sm text-foreground">Нет броней по текущим фильтрам.</p>
          <p className="mt-1 text-xs text-muted">Измените фильтры статуса или периода выше.</p>
        </Card>
      </div>
    );
  }

  const emptyFiltered = reservations.length === 0;

  return (
    <div className="space-y-4">
      <AdminReservationsSummary summary={todaySummary} />

      <AdminReservationsFilterBar statusFilter={statusFilter} timeFilter={timeFilter} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {mode === 'list'
            ? `Показано ${reservations.length} из ${total} · список по времени.`
            : `Показано ${reservations.length} из ${total} · по часам.`}
        </p>
        <div
          className="inline-flex rounded-xl border border-border/60 bg-surface-soft/80 p-1 shadow-card-soft"
          role="group"
          aria-label="Режим просмотра броней"
        >
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'list'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Список
          </button>
          <button
            type="button"
            onClick={() => setMode('timeline')}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'timeline'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Таймлайн
          </button>
        </div>
      </div>

      {mode === 'list' ? (
        <AdminReservationsList reservations={reservations} emptyFiltered={emptyFiltered} />
      ) : (
        <AdminReservationsTimeline reservations={reservations} emptyFiltered={emptyFiltered} />
      )}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-xs">
          <span className="text-muted">
            Страница {page} из {totalPages} · всего {total}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildReservationsPageHref({ page: page - 1, statusFilter, timeFilter })}
                className="rounded-md border border-border/70 px-2.5 py-1.5 font-semibold text-foreground transition-colors hover:bg-surface-soft"
              >
                Назад
              </Link>
            ) : (
              <span className="rounded-md border border-border/50 px-2.5 py-1.5 text-muted/60">Назад</span>
            )}
            {page < totalPages ? (
              <Link
                href={buildReservationsPageHref({ page: page + 1, statusFilter, timeFilter })}
                className="rounded-md border border-border/70 px-2.5 py-1.5 font-semibold text-foreground transition-colors hover:bg-surface-soft"
              >
                Вперёд
              </Link>
            ) : (
              <span className="rounded-md border border-border/50 px-2.5 py-1.5 text-muted/60">Вперёд</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildReservationsPageHref(input: {
  page: number;
  statusFilter: StatusFilter;
  timeFilter: TimeFilter;
}): string {
  const p = new URLSearchParams();
  p.set('page', String(input.page));
  if (input.statusFilter !== 'all') p.set('status', input.statusFilter);
  if (input.timeFilter !== 'all') p.set('time', input.timeFilter);
  const q = p.toString();
  return q ? `/admin/reservations?${q}` : '/admin/reservations';
}
