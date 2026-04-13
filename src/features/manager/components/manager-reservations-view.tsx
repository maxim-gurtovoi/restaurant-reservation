'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';
import { ManagerReservationsFilterBar } from '@/features/manager/components/manager-reservations-filter-bar';
import { ManagerReservationsList } from '@/features/manager/components/manager-reservations-list';
import { ManagerReservationsSummary } from '@/features/manager/components/manager-reservations-summary';
import { ManagerReservationsTimeline } from '@/features/manager/components/manager-reservations-timeline';
import {
  type StatusFilter,
  type TimeFilter,
  computeTodaySummary,
  filterManagerReservations,
} from '@/features/manager/lib/manager-reservations-filter-utils';

type ViewMode = 'list' | 'timeline';

export function ManagerReservationsView({
  reservations,
}: {
  reservations: ManagerReservationListItem[];
}) {
  const [mode, setMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const empty = !reservations.length;

  const summary = useMemo(() => computeTodaySummary(reservations), [reservations]);

  const filtered = useMemo(
    () => filterManagerReservations(reservations, statusFilter, timeFilter),
    [reservations, statusFilter, timeFilter],
  );

  const emptyFiltered = !empty && filtered.length === 0;

  if (empty) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        <p className="text-sm text-foreground">Пока нет бронирований по вашим ресторанам.</p>
        <p className="mt-1 text-xs text-muted">
          Когда гости начнут бронировать, записи появятся здесь.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ManagerReservationsSummary summary={summary} />

      <ManagerReservationsFilterBar
        timeFilter={timeFilter}
        statusFilter={statusFilter}
        onTimeChange={setTimeFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {mode === 'list'
            ? `Показано ${filtered.length} из ${reservations.length} · список по времени.`
            : `Показано ${filtered.length} из ${reservations.length} · по часам.`}
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
        <ManagerReservationsList reservations={filtered} emptyFiltered={emptyFiltered} />
      ) : (
        <ManagerReservationsTimeline reservations={filtered} emptyFiltered={emptyFiltered} />
      )}
    </div>
  );
}
