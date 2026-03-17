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
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-100">Plan your reservation</h2>

      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="res-date">
            Date
          </label>
          <input
            id="res-date"
            type="date"
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="res-time">
            Time
          </label>
          <input
            id="res-time"
            type="time"
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="res-guests">
            Guests
          </label>
          <input
            id="res-guests"
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100"
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        {isCheckingAvailability && (
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            Checking availability...
          </div>
        )}

        {!isCheckingAvailability && availabilityCheckedAt && !submissionError && (
          <div className="rounded-md border border-emerald-800/40 bg-emerald-500/5 p-3 text-xs text-emerald-300">
            ✓ Availability updated
          </div>
        )}

        {submissionError && (
          <div className="rounded-md border border-red-800/40 bg-red-500/5 p-3 text-xs text-red-300">
            {submissionError}
          </div>
        )}

        {!date || !time ? (
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            Select date and time to check availability
          </div>
        ) : null}

        <div className="mt-3 space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <p className="font-medium text-slate-200">Selected table</p>
          {selectedTable ? (
            <>
              <p className="text-slate-300">
                {selectedTable.label}{' '}
                <span className="text-slate-500">· up to {selectedTable.capacity} guests</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-amber-400">
                  Guest count exceeds table capacity. Consider reducing guests or choosing a larger
                  table.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-slate-500">Tap a table on the floor plan to select it.</p>
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
