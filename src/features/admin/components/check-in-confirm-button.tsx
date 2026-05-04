'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CheckInConfirmButton({
  token,
  disabled,
}: {
  token: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onConfirm = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/check-in/${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Не удалось подтвердить посещение');
      }
      setSuccess('Посещение отмечено.');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось подтвердить посещение';
      if (message.includes('CHECKED_IN')) {
        setError('Посещение по этой брони уже отмечено.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" className="w-full" onClick={onConfirm} disabled={disabled || loading}>
        {loading ? 'Подтверждение…' : 'Подтвердить посещение'}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {success ? <p className="text-xs text-accent-text">{success}</p> : null}
    </div>
  );
}

