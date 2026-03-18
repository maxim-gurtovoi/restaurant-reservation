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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!date || !time) {
      setUnavailableTableIds([]);
      setAvailabilityCheckedAt(null);
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const params = new URLSearchParams({
        restaurantId,
        date,
        time,
      });

      const response = await fetch(`/api/reservations/availability?${params}`);
      if (!response.ok) throw new Error(`Availability check failed: ${response.status}`);

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
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const result = await response.json();
      // Navigate to confirmation page
      router.push(`/reservations/${result.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create reservation';
      setSubmissionError(message);
      console.error('Error submitting reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;

  return (
    <section className="mt-2 space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Booking
        </p>
        <h2 className="text-lg font-semibold text-slate-50">
          Choose a table and time
        </h2>
        <p className="text-sm text-slate-400">
          Start by selecting a date and time, then pick a table on the floor plan to continue to
          booking.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <FloorPlanView
            floorPlans={floorPlans}
            tables={tables}
            selectedTableId={selectedTableId}
            unavailableTableIds={unavailableTableIds}
            onSelectTable={setSelectedTableId}
          />
        </div>

        <ReservationPanel
          date={date}
          time={time}
          guests={guests}
          selectedTable={
            selectedTable ? { id: selectedTable.id, label: selectedTable.label, capacity: selectedTable.capacity } : null
          }
          restaurantId={restaurantId}
          isCheckingAvailability={isCheckingAvailability}
          availabilityCheckedAt={availabilityCheckedAt}
          isSubmitting={isSubmitting}
          submissionError={submissionError}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          onGuestsChange={setGuests}
          onSubmit={handleSubmitReservation}
        />
      </div>
    </section>
  );
}
