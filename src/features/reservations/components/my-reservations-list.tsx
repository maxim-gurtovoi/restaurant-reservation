import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { UserReservationListItem } from '@/features/reservations/server/reservations.service';
import { formatReservationStatus } from '@/lib/reservation-status';

export function MyReservationsList({
  reservations,
}: {
  reservations: UserReservationListItem[];
}) {
  if (!reservations.length) {
    return (
      <Card className="border-dashed bg-slate-950/40">
        <p className="text-sm text-slate-300">You don&apos;t have any reservations yet.</p>
        <p className="mt-1 text-xs text-slate-500">
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
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTimeStr = end.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Link key={r.id} href={`/reservations/${r.id}`}>
            <Card className="cursor-pointer transition hover:border-emerald-500 hover:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-100">
                    {r.restaurant.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {dateStr} · {startTimeStr}–{endTimeStr}
                  </p>
                  <p className="text-xs text-slate-400">
                    Table {r.table.label} · {r.guestCount} guests
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-200">
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


