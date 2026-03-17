import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

type ReservationDetailsPageProps = {
  params: { id: string };
};

export default async function ReservationDetailsPage({
  params,
}: ReservationDetailsPageProps) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: params.id,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
      table: {
        select: {
          label: true,
          capacity: true,
        },
      },
    },
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservation Confirmed"
        subtitle="Your reservation has been successfully created."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Reservation ID</p>
            <p className="font-mono text-sm font-semibold text-slate-100">{reservation.id}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-sm font-semibold text-emerald-400">
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
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 mb-2">QR Token</p>
          <div className="rounded-md bg-slate-950/60 p-3 break-all">
            <p className="font-mono text-xs text-slate-300">{reservation.qrToken}</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            QR code rendering will be added soon. Use this token for check-in.
          </p>
        </div>

        {reservation.contactName && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-slate-400 mb-2">Contact Information</p>
            <div className="space-y-1">
              {reservation.contactName && (
                <p className="text-sm text-slate-100">
                  <span className="text-slate-400">Name: </span>
                  {reservation.contactName}
                </p>
              )}
              {reservation.contactPhone && (
                <p className="text-sm text-slate-100">
                  <span className="text-slate-400">Phone: </span>
                  {reservation.contactPhone}
                </p>
              )}
              {reservation.contactEmail && (
                <p className="text-sm text-slate-100">
                  <span className="text-slate-400">Email: </span>
                  {reservation.contactEmail}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-blue-950/20 border-blue-800/40">
        <p className="text-sm text-blue-300">
          Please save this reservation ID. You will need it for check-in at the restaurant.
        </p>
      </Card>
    </div>
  );
}
