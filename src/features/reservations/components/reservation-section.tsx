'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { TableShape } from '@prisma/client';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { ReservationPanel } from '@/features/reservations/components/reservation-panel';

type ReservationSectionProps = {
  restaurantId: string;
  floorPlans: {
    id: string;
    name: string;
    width: number;
    height: number;
  }[];
  tables: {
    id: string;
    floorPlanId: string;
    label: string;
    capacity: number;
    shape: TableShape;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isActive: boolean;
  }[];
};

export function ReservationSection({ restaurantId, floorPlans, tables }: ReservationSectionProps) {
  const router = useRouter();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [unavailableTableIds, setUnavailableTableIds] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState<Date | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

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
      setUnavailableTableIds(result.unavailableTableIds || []);

      // Clear selection if currently selected table became unavailable
      if (selectedTableId && result.unavailableTableIds.includes(selectedTableId)) {
        setSelectedTableId(null);
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
  }, [restaurantId, date, time, selectedTableId]);

  useEffect(() => {
    checkAvailability();
  }, [date, time, checkAvailability]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
  };

  const handleSubmitReservation = async (data: {
    restaurantId: string;
    tableId: string;
    date: string;
    time: string;
    guestCount: number;
  }) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось создать бронь');
      }

      const result = await response.json();
      // Navigate to confirmation page
      router.push(`/reservations/${result.id}`);
      // Ensure server components for the new route re-fetch data
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать бронь';
      setSubmissionError(message);
      console.error('Error submitting reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;
  const activeTablesCount = tables.filter((table) => table.isActive).length;

  return (
    <section className="mt-4 space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Бронирование
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          Забронируйте столик за несколько шагов
        </h2>
        <p className="text-sm text-muted">
          Сначала укажите дату, время и число гостей, затем выберите свободный стол на плане зала.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[2fr,1.1fr] lg:items-start">
        <div className="min-w-0 space-y-4">
          <FloorPlanView
            floorPlans={floorPlans}
            tables={tables}
            selectedTableId={selectedTableId}
            unavailableTableIds={unavailableTableIds}
            onSelectTable={setSelectedTableId}
          />
        </div>

        <div className="min-w-0">
          <ReservationPanel
            date={date}
            time={time}
            guests={guests}
            selectedTable={
              selectedTable
                ? { id: selectedTable.id, label: selectedTable.label, capacity: selectedTable.capacity }
                : null
            }
            restaurantId={restaurantId}
            isCheckingAvailability={isCheckingAvailability}
            availabilityCheckedAt={availabilityCheckedAt}
            availabilityError={availabilityError}
            activeTablesCount={activeTablesCount}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onGuestsChange={setGuests}
            onSubmit={handleSubmitReservation}
          />
        </div>
      </div>
    </section>
  );
}
