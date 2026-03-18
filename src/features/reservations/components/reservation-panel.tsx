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
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Step 1 · Choose date &amp; time
        </p>
        <h2 className="text-base font-semibold text-gray-900">Plan your visit</h2>
        <p className="text-sm text-gray-600">
          Start by selecting when you&apos;d like to arrive and how many guests are coming.
        </p>
      </header>

      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700" htmlFor="res-date">
              Date
            </label>
            <input
              id="res-date"
              type="date"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700" htmlFor="res-time">
              Time
            </label>
            <input
              id="res-time"
              type="time"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-700" htmlFor="res-guests">
            Guests
          </label>
          <input
            id="res-guests"
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          {isCheckingAvailability && (
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              <span className="mt-0.5 text-xs text-gray-400">●</span>
              <p>Checking availability…</p>
            </div>
          )}

          {!isCheckingAvailability && availabilityCheckedAt && !submissionError && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              <span className="mt-0.5 text-base">✓</span>
              <p>Availability updated for your selected date and time.</p>
            </div>
          )}

          {submissionError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <span className="mt-0.5 text-base">!</span>
              <p>{submissionError}</p>
            </div>
          )}

          {!date || !time ? (
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              <span className="mt-0.5 text-xs text-gray-400">i</span>
              <p>Select date and time to check table availability.</p>
            </div>
          ) : null}
        </div>

        <section className="mt-2 space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Selected table
          </p>
          {selectedTable ? (
            <>
              <p className="text-sm text-gray-800">
                {selectedTable.label}{' '}
                <span className="text-gray-500">· up to {selectedTable.capacity} guests</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-amber-700">
                  Guest count exceeds table capacity. Reduce guests or choose a larger table.
                </p>
              ) : (
                <p className="text-[11px] text-gray-500">
                  You can adjust your party size or pick a different table before confirming.
                </p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-gray-500">
              Tap a table on the floor plan to select it. Only available tables can be chosen.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Step 3 · Continue to booking
        </p>
        <Button
          type="button"
          className="w-full py-2.5 text-sm font-semibold"
          disabled={!canProceed}
          variant="primary"
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Booking...' : 'Continue to booking'}
        </Button>
        <div className="space-y-1 text-center text-[11px] text-gray-500">
          <p>You&apos;ll review all reservation details on the next step before confirming.</p>
          <p>Instant confirmation, with your QR code and full details, will be shown after booking.</p>
          <p>You can later view and cancel your reservation from the “My reservations” page.</p>
        </div>
      </div>
    </div>
  );
}
