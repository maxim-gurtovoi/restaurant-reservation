'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Failed to cancel reservation');
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full border-red-800/50 text-red-200 hover:bg-red-500/10"
        onClick={onCancel}
        disabled={isCancelling}
      >
        {isCancelling ? 'Cancelling…' : 'Cancel reservation'}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

