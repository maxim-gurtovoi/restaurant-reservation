'use client';

import { useState, useCallback } from 'react';
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
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isActive: boolean;
  }[];
};

export function ReservationSection({ restaurantId, floorPlans, tables }: ReservationSectionProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [unavailableTableIds, setUnavailableTableIds] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState<Date | null>(null);

  const checkAvailability = useCallback(
    async (newDate: string, newTime: string) => {
      if (!newDate || !newTime) {
        setUnavailableTableIds([]);
        setAvailabilityCheckedAt(null);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const params = new URLSearchParams({
          restaurantId,
          date: newDate,
          time: newTime,
        });

        const response = await fetch(`/api/reservations/availability?${params}`);
        const result = await response.json();

        if (response.ok && result.unavailableTableIds) {
          setUnavailableTableIds(result.unavailableTableIds || []);

          // Clear selection if currently selected table became unavailable
          if (selectedTableId && result.unavailableTableIds.includes(selectedTableId)) {
            setSelectedTableId(null);
          }

          setAvailabilityCheckedAt(new Date());
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        setUnavailableTableIds([]);
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [restaurantId, selectedTableId],
  );

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    checkAvailability(newDate, time);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    checkAvailability(date, newTime);
  };

  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1.2fr]">
      <FloorPlanView
        restaurantId={restaurantId}
        floorPlans={floorPlans}
        tables={tables}
        selectedTableId={selectedTableId}
        unavailableTableIds={unavailableTableIds}
        onSelectTable={setSelectedTableId}
      />
      <ReservationPanel
        date={date}
        time={time}
        guests={guests}
        selectedTable={
          selectedTable ? { label: selectedTable.label, capacity: selectedTable.capacity } : null
        }
        isCheckingAvailability={isCheckingAvailability}
        availabilityCheckedAt={availabilityCheckedAt}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        onGuestsChange={setGuests}
      />
    </div>
  );
}
