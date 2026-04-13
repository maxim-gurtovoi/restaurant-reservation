import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import { getReservationByQrTokenForManager } from '@/features/manager/server/check-in.service';
import { CheckInConfirmButton } from '@/features/manager/components/check-in-confirm-button';
import { formatReservationStatus } from '@/lib/reservation-status';
import { UI_LOCALE } from '@/lib/constants';

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ManagerCheckInPage({ params }: Props) {
  const manager = await getCurrentUser();
  if (!manager) notFound();

  const { token } = await params;
  const reservation = await getReservationByQrTokenForManager({
    managerUserId: manager.id,
    qrToken: token,
  });

  if (!reservation) notFound();

  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);

  const dateStr = start.toLocaleDateString(UI_LOCALE, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
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

  const canConfirm = reservation.status === 'CONFIRMED';
  const statusLabel = formatReservationStatus(reservation.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Заселение гостей"
        subtitle="Быстрый переход по QR — заселение также доступно на странице брони без сканирования."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted">Ресторан</p>
            <p className="text-sm text-foreground">{reservation.restaurant.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Статус</p>
            <p className="text-sm font-semibold text-foreground">{statusLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Бронь</p>
            <p className="font-mono text-xs text-foreground/90">{reservation.id}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Столик</p>
            <p className="text-sm text-foreground">{reservation.table.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Когда</p>
            <p className="text-sm text-foreground">
              {dateStr} · {startTimeStr}–{endTimeStr}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Гостей</p>
            <p className="text-sm text-foreground">{reservation.guestCount}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted">Контакт</p>
            <p className="text-sm text-foreground">{reservation.contactName || '—'}</p>
          </div>
        </div>

        {canConfirm ? (
          <CheckInConfirmButton token={token} />
        ) : (
          <div className="rounded-xl border border-border bg-background/80 p-3 text-xs text-muted">
            Заселение невозможно при статусе{' '}
            <span className="font-mono">{statusLabel}</span>.
          </div>
        )}

        <div className="border-t border-border pt-4">
          <Link
            href={`/manager/reservations/${reservation.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Полная карточка брони (статусы, ручное заселение)
          </Link>
        </div>
      </Card>

      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Подсказки</p>
        <ul className="space-y-1 text-xs text-muted">
          <li>• Перед подтверждением сверьте номер брони и имя гостя.</li>
          <li>• Если заселение уже отмечено, повтор не нужен.</li>
          <li>• Список броней позволяет работать без QR — QR только для быстрого доступа.</li>
        </ul>
      </Card>
    </div>
  );
}

