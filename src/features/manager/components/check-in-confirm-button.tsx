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
      const res = await fetch(`/api/manager/check-in/${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Failed to check in');
      }
      setSuccess('Guest check-in confirmed successfully.');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to check in';
      if (message.includes('status CHECKED_IN')) {
        setError('This reservation is already checked in.');
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
        {loading ? 'Confirming…' : 'Confirm check-in'}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-300">{success}</p> : null}
    </div>
  );
}

