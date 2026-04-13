import type { TodaySummary } from '@/features/manager/lib/manager-reservations-filter-utils';

export function ManagerReservationsSummary({ summary }: { summary: TodaySummary }) {
  const items = [
    { label: 'Подтверждено', value: summary.confirmed, tone: 'text-accent-text' },
    { label: 'Заселено', value: summary.checkedIn, tone: 'text-sky-800' },
    { label: 'Завершено', value: summary.completed, tone: 'text-emerald-800' },
    { label: 'Неявка', value: summary.noShow, tone: 'text-amber-900' },
  ] as const;

  return (
    <div className="rounded-2xl border border-border/55 bg-surface-soft/70 px-4 py-3 shadow-card-soft">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Сегодня (локально)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ label, value, tone }) => (
          <div key={label} className="min-w-0">
            <p className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
