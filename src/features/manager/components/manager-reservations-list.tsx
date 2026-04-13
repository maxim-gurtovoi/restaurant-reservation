import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';
import { formatReservationStatus } from '@/lib/reservation-status';
import { managerReservationStatusBadgeClass } from '@/features/manager/lib/manager-reservation-status';

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

export function ManagerReservationsList({
  reservations,
  emptyFiltered,
}: {
  reservations: ManagerReservationListItem[];
  /** True when the full dataset has items but filters exclude everything. */
  emptyFiltered?: boolean;
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        {emptyFiltered ? (
          <>
            <p className="text-sm text-foreground">No reservations match the current filters.</p>
            <p className="mt-1 text-xs text-muted">Try changing status or date filters above.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">No reservations for your restaurants yet.</p>
            <p className="mt-1 text-xs text-muted">
              Once guests start booking, their reservations will appear here.
            </p>
          </>
        )}
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
              <p className="text-sm font-semibold text-foreground">
                {r.contactName?.trim() || 'Guest'}
              </p>
              <p className="text-xs text-muted">
                {dateStr} · {startTimeStr}–{endTimeStr}
              </p>
              <p className="text-xs text-muted">
                {r.restaurant.name} · Table {r.table.label} · {r.guestCount} guests
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${managerReservationStatusBadgeClass(r.status)}`}
              >
                {formatReservationStatus(r.status)}
              </span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium text-primary">
                <Link href={`/manager/reservations/${r.id}`} className="hover:underline">
                  View details
                </Link>
                {canOpenCheckIn ? (
                  <Link
                    href={`/manager/check-in/${encodeURIComponent(r.qrToken)}`}
                    className="text-muted hover:text-primary hover:underline"
                    title="Optional: open the same reservation via QR shortcut"
                  >
                    QR shortcut
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
