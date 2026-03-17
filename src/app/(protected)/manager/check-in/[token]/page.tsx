import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import { getReservationByQrTokenForManager } from '@/features/manager/server/check-in.service';
import { CheckInConfirmButton } from '@/features/manager/components/check-in-confirm-button';

type Props = {
  params: { token: string };
};

export default async function ManagerCheckInPage({ params }: Props) {
  const manager = await getCurrentUser();
  if (!manager) notFound();

  const token = params.token;
  const reservation = await getReservationByQrTokenForManager({
    managerUserId: manager.id,
    qrToken: token,
  });

  if (!reservation) notFound();

  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTimeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const canConfirm = reservation.status === 'CONFIRMED';

  const statusLabel = (() => {
    switch (reservation.status) {
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
        return reservation.status;
    }
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest check-in"
        subtitle="Scan a QR code and confirm the guest&apos;s arrival."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Restaurant</p>
            <p className="text-sm text-slate-100">{reservation.restaurant.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-sm font-semibold text-slate-100">{statusLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Reservation</p>
            <p className="font-mono text-xs text-slate-200">{reservation.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Table</p>
            <p className="text-sm text-slate-100">{reservation.table.label}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">When</p>
            <p className="text-sm text-slate-100">
              {dateStr} · {startTimeStr}–{endTimeStr}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Guests</p>
            <p className="text-sm text-slate-100">{reservation.guestCount}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Contact</p>
            <p className="text-sm text-slate-100">{reservation.contactName || '—'}</p>
          </div>
        </div>

        {canConfirm ? (
          <CheckInConfirmButton token={token} />
        ) : (
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            This reservation cannot be checked in from status{' '}
            <span className="font-mono">{statusLabel}</span>.
          </div>
        )}
      </Card>
    </div>
  );
}

