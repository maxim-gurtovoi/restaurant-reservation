'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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

  const checkAvailability = useCallback(async () => {
    if (!date || !time) {
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      setAvailabilityError(null);
      return;
    }

    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    try {
      const params = new URLSearchParams({
        restaurantId,
        date,
        time,
      });

      const response = await fetch(`/api/reservations/availability?${params}`);
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
      console.error('Error checking availability:', error);
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      setAvailabilityError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить доступность. Попробуйте ещё раз.',
      );
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [restaurantId, date, time]);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  return {
    unavailableTableIds,
    isCheckingAvailability,
    availabilityCheckedAt,
    availabilityError,
    recheckAvailability: checkAvailability,
  };
}
