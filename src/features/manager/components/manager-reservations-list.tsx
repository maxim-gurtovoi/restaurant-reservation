import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';
import { formatReservationStatus } from '@/lib/reservation-status';

function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { dateStr, startTimeStr, endTimeStr };
}

function statusBadgeClass(status: string) {
  if (status === 'CANCELLED') return 'border-error/30 bg-error/8 text-error';
  if (status === 'CHECKED_IN') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (status === 'CONFIRMED') return 'border-accent-border/70 bg-accent-bg text-accent-text';
  return 'border-border/60 bg-surface-soft text-muted';
}

export function ManagerReservationsList({
  reservations,
}: {
  reservations: ManagerReservationListItem[];
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        <p className="text-sm text-foreground">No reservations for your restaurants yet.</p>
        <p className="mt-1 text-xs text-muted">
          Once guests start booking, their reservations will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => {
        const { dateStr, startTimeStr, endTimeStr } = formatDateRange(r.startAt, r.endAt);
        const canOpenCheckIn = r.status === 'CONFIRMED' && !!r.qrToken;

        return (
          <Card
            key={r.id}
            className="flex flex-col gap-3 border-border/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{r.restaurant.name}</p>
              <p className="text-xs text-muted">
                {dateStr} · {startTimeStr}–{endTimeStr}
              </p>
              <p className="text-xs text-muted">
                Table {r.table.label} · {r.guestCount} guests
              </p>
              {r.contactName ? (
                <p className="text-xs text-muted/80">Contact: {r.contactName}</p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadgeClass(r.status)}`}
              >
                {formatReservationStatus(r.status)}
              </span>
              <div className="flex gap-2 text-[11px] font-medium text-primary">
                <Link href={`/manager/reservations/${r.id}`} className="hover:underline">
                  View details
                </Link>
                {canOpenCheckIn && (
                  <>
                    <span className="text-muted">·</span>
                    <Link
                      href={`/manager/check-in/${encodeURIComponent(r.qrToken)}`}
                      className="hover:underline"
                    >
                      Open check-in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
