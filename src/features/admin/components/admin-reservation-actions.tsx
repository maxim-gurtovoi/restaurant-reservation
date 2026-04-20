'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ReservationStatus } from '@prisma/client';

type Props = {
  reservationId: string;
  status: ReservationStatus;
  qrToken: string;
};

export function AdminReservationActions({ reservationId, status, qrToken }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const postAction = async (action: 'check_in' | 'complete' | 'cancel' | 'no_show') => {
    if (loading) return;
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Запрос не выполнен');
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так');
    } finally {
      setLoading(null);
    }
  };

  const onCancel = () => {
    if (!confirm('Отменить эту бронь?')) return;
    void postAction('cancel');
  };

  const onNoShow = () => {
    if (!confirm('Отметить бронь как неявку?')) return;
    void postAction('no_show');
  };

  if (status === 'CONFIRMED') {
    return (
      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Действия</p>
        <p className="text-xs text-muted">
          Заселите гостей здесь без сканирования QR или воспользуйтесь QR-ссылкой ниже — тот же сценарий.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="primary"
            disabled={!!loading}
            onClick={() => void postAction('check_in')}
          >
            {loading === 'check_in' ? 'Заселение…' : 'Заселить гостей'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!!loading}
            onClick={onCancel}
          >
            {loading === 'cancel' ? 'Отмена…' : 'Отменить бронь'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!!loading}
            onClick={onNoShow}
          >
            {loading === 'no_show' ? 'Обновление…' : 'Неявка'}
          </Button>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-soft/80 px-3 py-2 text-xs text-muted">
          <span className="font-medium text-foreground/80">QR-ссылка: </span>
          <Link
            href={`/admin/check-in/${encodeURIComponent(qrToken)}`}
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
          >
            Открыть заселение по QR
          </Link>
          <span className="text-muted"> — та же бронь, быстрый доступ.</span>
        </div>
        {error ? <p className="text-xs text-error">{error}</p> : null}
      </div>
    );
  }

  if (status === 'CHECKED_IN') {
    return (
      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Действия</p>
        <Button
          type="button"
          variant="primary"
          disabled={!!loading}
          onClick={() => void postAction('complete')}
        >
          {loading === 'complete' ? 'Обновление…' : 'Завершить визит'}
        </Button>
        {error ? <p className="text-xs text-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-4">
      <p className="text-xs text-muted">
        Для этой брони действий больше нет ({status.replace(/_/g, ' ').toLowerCase()}).
      </p>
    </div>
  );
}
