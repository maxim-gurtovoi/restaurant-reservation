import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { UserReservationListItem } from '@/features/reservations/server/reservations.service';
import { formatReservationStatus } from '@/lib/reservation-status';

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
        <p className="text-sm text-foreground">You don&apos;t have any reservations yet.</p>
        <p className="mt-1 text-xs text-muted">
          Book a table on a restaurant page to see it here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => {
        const start = new Date(r.startAt);
        const end = new Date(r.endAt);

        const dateStr = start.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const startTimeStr = start.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: false,
        });
        const endTimeStr = end.toLocaleTimeString('en-US', {
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
                    Table {r.table.label} · {r.guestCount} guests
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
