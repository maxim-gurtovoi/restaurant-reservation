import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/server/auth';
import { getReservationDetailsForAdmin } from '@/features/admin/server/admin.service';
import { formatReservationStatus } from '@/lib/reservation-status';
import { UI_LOCALE } from '@/lib/constants';
import { AdminReservationActions } from '@/features/admin/components/admin-reservation-actions';
import { formatReferenceCode } from '@/features/reservations/lib/reference-code';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReservationDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { id: reservationId } = await params;
  const reservation = await getReservationDetailsForAdmin({
    reservationId,
    adminUserId: user.id,
  });

  if (!reservation) notFound();

  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  const dateStr = start.toLocaleDateString(UI_LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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
  const statusLabel = formatReservationStatus(reservation.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Детали брони"
          subtitle="Оперативный вид — смена статуса или заселение без QR."
        />
        <Link
          href="/admin/reservations"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          ← К списку
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted">Гость</p>
            <p className="text-lg font-semibold text-foreground">
              {reservation.contactName || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Номер брони</p>
            <p className="font-mono text-lg font-bold tracking-wider text-foreground">
              {formatReferenceCode(reservation.referenceCode)}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-muted/80" title="Внутренний идентификатор">
              {reservation.id}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Статус</p>
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
            <p className="text-xs font-medium text-muted">Ресторан</p>
            <p className="text-sm text-foreground">{reservation.restaurant.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Столик</p>
            <p className="text-sm text-foreground">{reservation.table.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Дата</p>
            <p className="text-sm text-foreground">{dateStr}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Время</p>
            <p className="text-sm text-foreground">
              {startTimeStr} – {endTimeStr}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Гостей</p>
            <p className="text-sm text-foreground">{reservation.guestCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Создано</p>
            <p className="text-sm text-foreground">
              {new Date(reservation.createdAt).toLocaleString(UI_LOCALE, { hour12: false })}
            </p>
          </div>
          {reservation.checkedInAt ? (
            <div>
              <p className="text-xs font-medium text-muted">Заселение</p>
              <p className="text-sm text-foreground">
                {new Date(reservation.checkedInAt).toLocaleString(UI_LOCALE, { hour12: false })}
              </p>
            </div>
          ) : null}
          {reservation.cancelledAt ? (
            <div>
              <p className="text-xs font-medium text-muted">Отменено</p>
              <p className="text-sm text-foreground">
                {new Date(reservation.cancelledAt).toLocaleString(UI_LOCALE, { hour12: false })}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted">Контакты</p>
          <div className="space-y-1 text-sm text-foreground">
            <p>Имя: {reservation.contactName || '—'}</p>
            <p>Телефон: {reservation.contactPhone || '—'}</p>
            <p>Email: {reservation.contactEmail || '—'}</p>
          </div>
        </div>

        <AdminReservationActions
          reservationId={reservation.id}
          status={reservation.status}
          qrToken={reservation.qrToken}
        />
      </Card>
    </div>
  );
}
