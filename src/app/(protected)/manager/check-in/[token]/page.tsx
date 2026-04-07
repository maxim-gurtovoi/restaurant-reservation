import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import { getReservationByQrTokenForManager } from '@/features/manager/server/check-in.service';
import { CheckInConfirmButton } from '@/features/manager/components/check-in-confirm-button';
import { formatReservationStatus } from '@/lib/reservation-status';

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

  const canConfirm = reservation.status === 'CONFIRMED';
  const statusLabel = formatReservationStatus(reservation.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest check-in"
        subtitle="Scan a QR code and confirm the guest&apos;s arrival."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted">Restaurant</p>
            <p className="text-sm text-foreground">{reservation.restaurant.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Status</p>
            <p className="text-sm font-semibold text-foreground">{statusLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Reservation</p>
            <p className="font-mono text-xs text-foreground/90">{reservation.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Table</p>
            <p className="text-sm text-foreground">{reservation.table.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">When</p>
            <p className="text-sm text-foreground">
              {dateStr} · {startTimeStr}–{endTimeStr}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Guests</p>
            <p className="text-sm text-foreground">{reservation.guestCount}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted">Contact</p>
            <p className="text-sm text-foreground">{reservation.contactName || '—'}</p>
          </div>
        </div>

        {canConfirm ? (
          <CheckInConfirmButton token={token} />
        ) : (
          <div className="rounded-xl border border-border bg-background/80 p-3 text-xs text-muted">
            This reservation cannot be checked in from status{' '}
            <span className="font-mono">{statusLabel}</span>.
          </div>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Check-in tips</p>
        <ul className="space-y-1 text-xs text-muted">
          <li>• Verify reservation id and guest name before confirming.</li>
          <li>• If already checked in, no second confirmation is needed.</li>
          <li>• Use reservations list for manual follow-up and status tracking.</li>
        </ul>
      </Card>
    </div>
  );
}

