'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 320;

type UseReservationAvailabilityOptions = {
  restaurantId: string;
  date: string;
  time: string;
  /** When set, selection is cleared if this table id appears in unavailable list after a check. */
  selectedTableId: string | null;
  onSelectedTableCleared?: () => void;
};

export function useReservationAvailability({
  restaurantId,
  date,
  time,
  selectedTableId,
  onSelectedTableCleared,
}: UseReservationAvailabilityOptions) {
  const [unavailableTableIds, setUnavailableTableIds] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState<Date | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const selectedRef = useRef(selectedTableId);
  const clearRef = useRef(onSelectedTableCleared);
  selectedRef.current = selectedTableId;
  clearRef.current = onSelectedTableCleared;

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const checkAvailability = useCallback(async () => {
    if (!date || !time) {
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      setAvailabilityError(null);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const myId = ++requestIdRef.current;

    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    try {
      const params = new URLSearchParams({
        restaurantId,
        date,
        time,
      });

      const response = await fetch(`/api/reservations/availability?${params}`, {
        signal: ac.signal,
      });
      if (myId !== requestIdRef.current) return;

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const message =
          typeof errorPayload?.error === 'string'
            ? errorPayload.error
            : `Ошибка проверки доступности: ${response.status}`;
        throw new Error(message);
      }

      const result = await response.json();
      const unavailable: string[] = result.unavailableTableIds || [];
      setUnavailableTableIds(unavailable);

      const sel = selectedRef.current;
      if (sel && unavailable.includes(sel)) {
        clearRef.current?.();
      }

      setAvailabilityCheckedAt(new Date());
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (myId !== requestIdRef.current) return;
      console.error('Error checking availability:', error);
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      setAvailabilityError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить доступность. Попробуйте ещё раз.',
      );
    } finally {
      if (myId === requestIdRef.current) {
        setIsCheckingAvailability(false);
      }
    }
  }, [restaurantId, date, time]);

  useEffect(() => {
    if (!date || !time) {
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      setAvailabilityError(null);
      return;
    }

    const t = window.setTimeout(() => {
      void checkAvailability();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(t);
      abortRef.current?.abort();
    };
  }, [checkAvailability, date, time]);

  return {
    unavailableTableIds,
    isCheckingAvailability,
    availabilityCheckedAt,
    availabilityError,
    recheckAvailability: checkAvailability,
  };
}
