import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { ManagerReservationListItem } from '@/features/manager/server/manager.service';

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
  });
  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { dateStr, startTimeStr, endTimeStr };
}

function statusClass(status: string) {
  if (status === 'CANCELLED') return 'text-red-300 border-red-700/60';
  if (status === 'CHECKED_IN') return 'text-blue-300 border-blue-700/60';
  if (status === 'CONFIRMED') return 'text-emerald-300 border-emerald-700/60';
  return 'text-slate-200 border-slate-700/60';
}

function formatStatus(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CHECKED_IN':
      return 'Checked in';
    case 'CANCELLED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    case 'NO_SHOW':
      return 'No show';
    default:
      return status;
  }
}

export function ManagerReservationsList({
  reservations,
}: {
  reservations: ManagerReservationListItem[];
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed bg-slate-950/40">
        <p className="text-sm text-slate-300">No reservations for your restaurants yet.</p>
        <p className="mt-1 text-xs text-slate-500">
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
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-100">{r.restaurant.name}</p>
              <p className="text-xs text-slate-400">
                {dateStr} · {startTimeStr}–{endTimeStr}
              </p>
              <p className="text-xs text-slate-400">
                Table {r.table.label} · {r.guestCount} guests
              </p>
              {r.contactName ? (
                <p className="text-xs text-slate-500">Contact: {r.contactName}</p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-[11px] ${statusClass(
                  r.status,
                )}`}
              >
                {formatStatus(r.status)}
              </span>
              <div className="flex gap-2 text-[11px] text-emerald-300">
                <Link href={`/reservations/${r.id}`} className="hover:underline">
                  View details
                </Link>
                {canOpenCheckIn && (
                  <>
                    <span className="text-slate-600">·</span>
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

