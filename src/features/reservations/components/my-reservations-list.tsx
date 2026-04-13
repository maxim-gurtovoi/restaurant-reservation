import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { UserReservationListItem } from '@/features/reservations/server/reservations.service';
import { formatReservationStatus } from '@/lib/reservation-status';
import { UI_LOCALE } from '@/lib/constants';

function listStatusBadgeClass(status: string) {
  if (status === 'CANCELLED') return 'border-error/30 bg-error/8 text-error';
  if (status === 'CHECKED_IN') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (status === 'CONFIRMED') return 'border-accent-border/70 bg-accent-bg text-accent-text';
  return 'border-border/60 bg-surface-soft text-muted';
}

export function MyReservationsList({
  reservations,
}: {
  reservations: UserReservationListItem[];
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        <p className="text-sm text-foreground">У вас пока нет бронирований.</p>
        <p className="mt-1 text-xs text-muted">
          Забронируйте столик на странице ресторана — бронь появится здесь.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => {
        const start = new Date(r.startAt);
        const end = new Date(r.endAt);

        const dateStr = start.toLocaleDateString(UI_LOCALE, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const startTimeStr = start.toLocaleTimeString(UI_LOCALE, {
          hour: '2-digit', minute: '2-digit', hour12: false,
        });
        const endTimeStr = end.toLocaleTimeString(UI_LOCALE, {
          hour: '2-digit', minute: '2-digit', hour12: false,
        });

        return (
          <Link key={r.id} href={`/reservations/${r.id}`}>
            <Card className="cursor-pointer border-border/50 transition hover:border-accent-border/60 hover:shadow-card-strong">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {r.restaurant.name}
                  </p>
                  <p className="text-xs text-muted">
                    {dateStr} · {startTimeStr}–{endTimeStr}
                  </p>
                  <p className="text-xs text-muted">
                    Стол {r.table.label} · гостей: {r.guestCount}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${listStatusBadgeClass(r.status)}`}
                >
                  {formatReservationStatus(r.status)}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
