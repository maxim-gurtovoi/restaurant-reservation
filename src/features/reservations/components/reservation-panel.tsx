'use client';

import { Button } from '@/components/ui/button';

type SelectedTableInfo = {
  id: string;
  label: string;
  capacity: number;
} | null;

type ReservationPanelProps = {
  date: string;
  time: string;
  guests: number;
  selectedTable: SelectedTableInfo;
  restaurantId: string;
  isCheckingAvailability?: boolean;
  availabilityCheckedAt?: Date | null;
  isSubmitting?: boolean;
  submissionError?: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onGuestsChange: (guests: number) => void;
  onSubmit?: (data: {
    restaurantId: string;
    tableId: string;
    date: string;
    time: string;
    guestCount: number;
  }) => Promise<void>;
};

export function ReservationPanel({
  date,
  time,
  guests,
  selectedTable,
  restaurantId,
  isCheckingAvailability = false,
  availabilityCheckedAt = null,
  isSubmitting = false,
  submissionError = null,
  onDateChange,
  onTimeChange,
  onGuestsChange,
  onSubmit,
}: ReservationPanelProps) {
  const exceedsCapacity = selectedTable != null && guests > selectedTable.capacity;

  const canProceed = !!selectedTable && !exceedsCapacity && date && time && !isSubmitting;

  const handleSubmit = async () => {
    if (!canProceed || !selectedTable || !onSubmit) return;
    await onSubmit({
      restaurantId,
      tableId: selectedTable.id,
      date,
      time,
      guestCount: guests,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">Plan your reservation</h2>

      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="res-date">
            Date
          </label>
          <input
            id="res-date"
            type="date"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="res-time">
            Time
          </label>
          <input
            id="res-time"
            type="time"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-gray-600" htmlFor="res-guests">
            Guests
          </label>
          <input
            id="res-guests"
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        {isCheckingAvailability && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            Checking availability...
          </div>
        )}

        {!isCheckingAvailability && availabilityCheckedAt && !submissionError && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700">
            ✓ Availability updated
          </div>
        )}

        {submissionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {submissionError}
          </div>
        )}

        {!date || !time ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            Select date and time to check availability
          </div>
        ) : null}

        <div className="mt-3 space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
          <p className="font-medium text-gray-700">Selected table</p>
          {selectedTable ? (
            <>
              <p className="text-gray-600">
                {selectedTable.label}{' '}
                <span className="text-gray-500">· up to {selectedTable.capacity} guests</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-amber-600">
                  Guest count exceeds table capacity. Consider reducing guests or choosing a larger
                  table.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-gray-500">Tap a table on the floor plan to select it.</p>
          )}
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!canProceed}
        variant="primary"
        onClick={handleSubmit}
      >
        {isSubmitting ? 'Booking...' : 'Continue to booking'}
      </Button>
    </div>
  );
}
