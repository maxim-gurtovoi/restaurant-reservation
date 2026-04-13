import Link from 'next/link';
import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';
import { managerReservationStatusBadgeClass } from '@/features/manager/lib/manager-reservation-status';
import { formatReservationStatus } from '@/lib/reservation-status';

function formatTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return `${start.toLocaleTimeString('en-US', opts)}–${end.toLocaleTimeString('en-US', opts)}`;
}

function formatHourBlockLabel(bucketDate: Date) {
  return bucketDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Sort ascending by start time, then group by local hour (start of hour). */
function buildHourGroups(reservations: ManagerReservationListItem[]) {
  const sorted = [...reservations].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  const map = new Map<number, ManagerReservationListItem[]>();
  for (const r of sorted) {
    const d = new Date(r.startAt);
    const bucket = new Date(d);
    bucket.setMinutes(0, 0, 0);
    bucket.setSeconds(0, 0);
    bucket.setMilliseconds(0);
    const k = bucket.getTime();
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }

  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ms, rows]) => ({ bucket: new Date(ms), rows }));
}

export function ManagerReservationsTimeline({
  reservations,
  emptyFiltered,
}: {
  reservations: ManagerReservationListItem[];
  emptyFiltered?: boolean;
}) {
  if (!reservations.length) {
    if (emptyFiltered) {
      return (
        <div className="rounded-xl border border-dashed border-border/50 bg-surface-soft/60 px-4 py-6 text-center text-sm text-muted">
          No reservations match the current filters. Adjust filters or switch to list view.
        </div>
      );
    }
    return null;
  }

  const groups = buildHourGroups(reservations);

  return (
    <div className="space-y-8">
      {groups.map(({ bucket, rows }) => (
        <section key={bucket.getTime()} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {formatHourBlockLabel(bucket)}
            </h2>
            <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
          </div>

          <ul className="space-y-2">
            {rows.map((r) => {
              const canOpenCheckIn = r.status === 'CONFIRMED' && !!r.qrToken;
              const guestLabel = r.contactName?.trim() || 'Guest';

              return (
                <li key={r.id}>
                  <div className="flex flex-col gap-2 rounded-xl border border-border/45 bg-surface-soft/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                        {formatTimeRange(r.startAt, r.endAt)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{guestLabel}</span>
                      <span className="text-xs text-muted">
                        Table {r.table.label} · {r.guestCount} guests · {r.restaurant.name}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${managerReservationStatusBadgeClass(r.status)}`}
                      >
                        {formatReservationStatus(r.status)}
                      </span>
                      <Link
                        href={`/manager/reservations/${r.id}`}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        Details
                      </Link>
                      {canOpenCheckIn ? (
                        <Link
                          href={`/manager/check-in/${encodeURIComponent(r.qrToken)}`}
                          className="text-[11px] font-medium text-muted hover:text-primary hover:underline"
                          title="QR shortcut"
                        >
                          QR
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
