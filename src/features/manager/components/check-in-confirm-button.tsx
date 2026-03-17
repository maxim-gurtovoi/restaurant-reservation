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

  const onConfirm = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/manager/check-in/${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Failed to check in');
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check in');
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
    </div>
  );
}

