import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/server/auth';
import { getReservationDetailsForManager } from '@/features/manager/server/manager.service';
import { formatReservationStatus } from '@/lib/reservation-status';

type Props = {
  params: { id: string };
};

export default async function ManagerReservationDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const reservationId = params.id;
  const reservation = await getReservationDetailsForManager({
    reservationId,
    managerUserId: user.id,
  });

  if (!reservation) notFound();

  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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
  const statusLabel = formatReservationStatus(reservation.status);
  const canOpenCheckIn = reservation.status === 'CONFIRMED' && !!reservation.qrToken;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservation details"
        subtitle="View reservation information for your restaurant."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted">Reservation ID</p>
            <p className="font-mono text-sm font-semibold text-foreground">{reservation.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Status</p>
            <p
              className={
                reservation.status === 'CANCELLED'
                  ? 'text-sm font-semibold text-error'
                  : 'text-sm font-semibold text-foreground'
              }
            >
              {statusLabel}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Restaurant</p>
            <p className="text-sm text-foreground">{reservation.restaurant.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Table</p>
            <p className="text-sm text-foreground">{reservation.table.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Date</p>
            <p className="text-sm text-foreground">{dateStr}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Time</p>
            <p className="text-sm text-foreground">
              {startTimeStr} – {endTimeStr}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Guest count</p>
            <p className="text-sm text-foreground">{reservation.guestCount} guests</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Created</p>
            <p className="text-sm text-foreground">
              {new Date(reservation.createdAt).toLocaleString('en-US', { hour12: false })}
            </p>
          </div>
          {reservation.checkedInAt ? (
            <div>
              <p className="text-xs font-medium text-muted">Checked in</p>
              <p className="text-sm text-foreground">
                {new Date(reservation.checkedInAt).toLocaleString('en-US', { hour12: false })}
              </p>
            </div>
          ) : null}
          {reservation.cancelledAt ? (
            <div>
              <p className="text-xs font-medium text-muted">Cancelled</p>
              <p className="text-sm text-foreground">
                {new Date(reservation.cancelledAt).toLocaleString('en-US', { hour12: false })}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted">Contact</p>
          <div className="space-y-1 text-sm text-foreground">
            <p>Name: {reservation.contactName || '—'}</p>
            <p>Phone: {reservation.contactPhone || '—'}</p>
            <p>Email: {reservation.contactEmail || '—'}</p>
          </div>
        </div>

        {reservation.qrToken ? (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted">QR token</p>
            <p className="break-all font-mono text-xs text-foreground/85">{reservation.qrToken}</p>
          </div>
        ) : null}

        {canOpenCheckIn ? (
          <div className="border-t border-border pt-4">
            <Button asChild variant="primary">
              <Link href={`/manager/check-in/${encodeURIComponent(reservation.qrToken)}`}>
                Open check-in
              </Link>
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
