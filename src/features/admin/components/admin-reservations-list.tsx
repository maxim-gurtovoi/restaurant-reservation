import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { AdminReservationListItem } from '@/features/admin/server/admin.service';
import { formatReservationStatus } from '@/lib/reservation-status';
import { adminReservationStatusBadgeClass } from '@/features/admin/lib/admin-reservation-status';
import { UI_LOCALE } from '@/lib/constants';
import { formatReferenceCode } from '@/features/reservations/lib/reference-code';

function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const dateStr = start.toLocaleDateString(UI_LOCALE, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTimeStr = start.toLocaleTimeString(UI_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const endTimeStr = end.toLocaleTimeString(UI_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { dateStr, startTimeStr, endTimeStr };
}

export function AdminReservationsList({
  reservations,
  emptyFiltered,
}: {
  reservations: AdminReservationListItem[];
  /** True when the full dataset has items but filters exclude everything. */
  emptyFiltered?: boolean;
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed border-border/50 bg-surface">
        {emptyFiltered ? (
          <>
            <p className="text-sm text-foreground">Нет броней по текущим фильтрам.</p>
            <p className="mt-1 text-xs text-muted">Измените фильтры статуса или даты выше.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">Пока нет бронирований по вашим ресторанам.</p>
            <p className="mt-1 text-xs text-muted">
              Когда гости начнут бронировать, записи появятся здесь.
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
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {r.contactName?.trim() || 'Гость'}
                </p>
                <span className="font-mono text-[11px] tracking-wider text-muted">
                  № {formatReferenceCode(r.referenceCode)}
                </span>
              </div>
              <p className="text-xs text-muted">
                {dateStr} · {startTimeStr}–{endTimeStr}
              </p>
              <p className="text-xs text-muted">
                {r.restaurant.name} · стол {r.table.label} · гостей: {r.guestCount}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${adminReservationStatusBadgeClass(r.status)}`}
              >
                {formatReservationStatus(r.status)}
              </span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium text-primary">
                <Link href={`/admin/reservations/${r.id}`} className="hover:underline">
                  Подробнее
                </Link>
                {canOpenCheckIn ? (
                  <Link
                    href={`/admin/check-in/${encodeURIComponent(r.qrToken)}`}
                    className="text-muted hover:text-primary hover:underline"
                    title="Открыть ту же бронь по QR"
                  >
                    По QR
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
