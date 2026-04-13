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
import { UI_LOCALE } from '@/lib/constants';

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

  const dateStr = startTime.toLocaleDateString(UI_LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startTimeStr = startTime.toLocaleTimeString(UI_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const endTimeStr = endTime.toLocaleTimeString(UI_LOCALE, {
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
        title="Бронирование"
        subtitle="Детали вашей брони и QR для заселения."
      />

      <Card className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[1fr,260px]">
          <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted">Номер брони</p>
            <p className="font-mono text-sm font-semibold text-foreground">{reservation.id}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted">Статус</p>
            <p
              className={[
                'text-sm font-semibold',
                reservation.status === 'CANCELLED' ? 'text-error' : 'text-accent-text',
              ].join(' ')}
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
            <p className="text-sm text-foreground">
              {reservation.table.label} ({reservation.table.capacity} мест)
            </p>
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
          {reservation.cancelledAt ? (
            <div>
              <p className="text-xs font-medium text-muted">Отменено</p>
              <p className="text-sm text-foreground">
                {new Date(reservation.cancelledAt).toLocaleString(UI_LOCALE, { hour12: false })}
              </p>
            </div>
          ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">QR для заселения</p>
            <QrCode value={checkInUrl} />
            <div className="space-y-1">
              <p className="text-[11px] text-muted">
                Отсканируйте QR, чтобы открыть страницу заселения для менеджера.
              </p>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background p-2">
                <p className="truncate font-mono text-[10px] text-muted">
                  {checkInUrl}
                </p>
                <CopyButton value={checkInUrl} label="Копировать ссылку" small />
              </div>
            </div>
            {isCancellable ? (
              <div className="pt-2">
                <CancelReservationButton reservationId={reservation.id} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted">Токен QR</p>
          <div className="break-all rounded-xl border border-border/60 bg-background p-3">
            <p className="font-mono text-xs text-foreground/85">{reservation.qrToken}</p>
          </div>
          <p className="mt-2 text-xs text-muted">
            Токен привязан к брони и используется при заселении.
          </p>
          <div className="mt-2">
            <CopyButton value={reservation.qrToken} label="Копировать токен" small />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted">Контакты</p>
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              <span className="text-muted">Имя: </span>
              {reservation.contactName || '—'}
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted">Телефон: </span>
              {reservation.contactPhone || '—'}
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted">Email: </span>
              {reservation.contactEmail || '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-primary/25 bg-primary/5">
        <p className="text-sm text-foreground">
          Совет: оставьте эту страницу под рукой. Для заселения быстрее всего отсканировать QR.
        </p>
      </Card>
    </div>
  );
}
