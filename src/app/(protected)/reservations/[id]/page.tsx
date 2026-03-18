import { notFound } from 'next/navigation';
import { unstable_noStore } from 'next/cache';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { QrCode } from '@/components/qr/qr-code';
import { getCurrentUser } from '@/server/auth';
import { getReservationDetailsById } from '@/features/reservations/server/get-reservation-details';
import { CancelReservationButton } from '@/features/reservations/components/cancel-reservation-button';
import { CopyButton } from '@/components/ui/copy-button';
import { formatReservationStatus } from '@/lib/reservation-status';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReservationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailsPage({
  params,
}: ReservationDetailsPageProps) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { id } = await params;
  // Disable caching so each new reservation id shows fresh data.
  unstable_noStore();
  const reservation = await getReservationDetailsById({
    reservationId: id,
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
    hour12: false,
  });

  const endTimeStr = endTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : 'http://localhost:3000';
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const checkInUrl = `${normalizedBaseUrl}/manager/check-in/${encodeURIComponent(
    reservation.qrToken,
  )}`;

  const isCancellable = reservation.status === 'CONFIRMED';
  const statusLabel = formatReservationStatus(reservation.status);

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
            <p className="text-xs text-gray-500">Reservation ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{reservation.id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p
              className={[
                'text-sm font-semibold',
                reservation.status === 'CANCELLED' ? 'text-red-600' : 'text-primary',
              ].join(' ')}
            >
              {statusLabel}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Restaurant</p>
            <p className="text-sm text-gray-900">{reservation.restaurant.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Table</p>
            <p className="text-sm text-gray-900">
              {reservation.table.label} ({reservation.table.capacity} seats)
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm text-gray-900">{dateStr}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-sm text-gray-900">
              {startTimeStr} – {endTimeStr}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Guest Count</p>
            <p className="text-sm text-gray-900">{reservation.guestCount} guests</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-gray-900">
              {new Date(reservation.createdAt).toLocaleString('en-US', { hour12: false })}
            </p>
          </div>
          {reservation.cancelledAt ? (
            <div>
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-sm text-gray-900">
                {new Date(reservation.cancelledAt).toLocaleString('en-US', { hour12: false })}
              </p>
            </div>
          ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500">Check-in QR</p>
            <QrCode value={checkInUrl} />
            <div className="space-y-1">
              <p className="text-[11px] text-gray-500">
                Scan this QR code to open the manager check-in page.
              </p>
              <div className="flex items-center justify-between gap-2 rounded-md bg-gray-100 p-2">
                <p className="truncate font-mono text-[10px] text-gray-600">
                  {checkInUrl}
                </p>
                <CopyButton value={checkInUrl} label="Copy URL" small />
              </div>
            </div>
            {isCancellable ? (
              <div className="pt-2">
                <CancelReservationButton reservationId={reservation.id} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 mb-2">QR Token</p>
          <div className="rounded-md bg-gray-100 p-3 break-all">
            <p className="font-mono text-xs text-gray-600">{reservation.qrToken}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This token is linked to the reservation and used for check-in.
          </p>
          <div className="mt-2">
            <CopyButton value={reservation.qrToken} label="Copy token" small />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 mb-2">Contact Information</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="text-gray-500">Name: </span>
              {reservation.contactName || '—'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="text-gray-500">Phone: </span>
              {reservation.contactPhone || '—'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="text-gray-500">Email: </span>
              {reservation.contactEmail || '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          Tip: keep this screen available. For check-in, the QR code is the fastest option.
        </p>
      </Card>
    </div>
  );
}
