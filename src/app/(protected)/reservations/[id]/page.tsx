import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { QrCode } from '@/components/qr/qr-code';
import { getCurrentUser } from '@/server/auth';
import { getReservationDetailsById } from '@/features/reservations/server/get-reservation-details';
import { CancelReservationButton } from '@/features/reservations/components/cancel-reservation-button';

type ReservationDetailsPageProps = {
  params: { id: string };
};

export default async function ReservationDetailsPage({
  params,
}: ReservationDetailsPageProps) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const reservation = await getReservationDetailsById({
    reservationId: params.id,
    userId: user.id,
  });

  if (!reservation) {
    notFound();
  }

  const startTime = new Date(reservation.startAt);
  const endTime = new Date(reservation.endAt);

  const dateStr = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startTimeStr = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTimeStr = endTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const checkInPayload = `qr:${reservation.qrToken}`;
  const isCancellable = reservation.status === 'CONFIRMED';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservation Confirmed"
        subtitle="Your reservation has been successfully created."
      />

      <Card className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[1fr,260px]">
          <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Reservation ID</p>
            <p className="font-mono text-sm font-semibold text-slate-100">{reservation.id}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p
              className={[
                'text-sm font-semibold',
                reservation.status === 'CANCELLED' ? 'text-red-300' : 'text-emerald-400',
              ].join(' ')}
            >
              {reservation.status}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Restaurant</p>
            <p className="text-sm text-slate-100">{reservation.restaurant.name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Table</p>
            <p className="text-sm text-slate-100">
              {reservation.table.label} ({reservation.table.capacity} seats)
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Date</p>
            <p className="text-sm text-slate-100">{dateStr}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Time</p>
            <p className="text-sm text-slate-100">
              {startTimeStr} – {endTimeStr}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Guest Count</p>
            <p className="text-sm text-slate-100">{reservation.guestCount} guests</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="text-sm text-slate-100">
              {new Date(reservation.createdAt).toLocaleString('en-US')}
            </p>
          </div>
          {reservation.cancelledAt ? (
            <div>
              <p className="text-xs text-slate-400">Cancelled</p>
              <p className="text-sm text-slate-100">
                {new Date(reservation.cancelledAt).toLocaleString('en-US')}
              </p>
            </div>
          ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">Check-in QR</p>
            <QrCode value={checkInPayload} />
            <p className="text-[11px] text-slate-500">
              Show this QR code at the restaurant entrance for check-in.
            </p>
            {isCancellable ? (
              <div className="pt-2">
                <CancelReservationButton reservationId={reservation.id} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 mb-2">QR Token</p>
          <div className="rounded-md bg-slate-950/60 p-3 break-all">
            <p className="font-mono text-xs text-slate-300">{reservation.qrToken}</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            This token is encoded in the QR above (payload: <span className="font-mono">qr:&lt;token&gt;</span>).
          </p>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 mb-2">Contact Information</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-100">
              <span className="text-slate-400">Name: </span>
              {reservation.contactName || '—'}
            </p>
            <p className="text-sm text-slate-100">
              <span className="text-slate-400">Phone: </span>
              {reservation.contactPhone || '—'}
            </p>
            <p className="text-sm text-slate-100">
              <span className="text-slate-400">Email: </span>
              {reservation.contactEmail || '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-950/20 border-blue-800/40">
        <p className="text-sm text-blue-300">
          Tip: keep this screen available. For check-in, the QR code is the fastest option.
        </p>
      </Card>
    </div>
  );
}
