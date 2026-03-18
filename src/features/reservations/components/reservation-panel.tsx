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
    <div className="space-y-5 rounded-xl border border-slate-800/60 bg-slate-950/60 p-5 shadow-sm backdrop-blur">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-50">Plan your reservation</h2>
        <p className="text-sm text-slate-400">
          Choose date, time and party size, then confirm your table.
        </p>
      </header>

      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="res-date">
              Date
            </label>
            <input
              id="res-date"
              type="date"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="res-time">
              Time
            </label>
            <input
              id="res-time"
              type="time"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300" htmlFor="res-guests">
            Guests
          </label>
          <input
            id="res-guests"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          {isCheckingAvailability && (
            <div className="flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-300">
              <span className="mt-0.5 text-xs text-slate-500">●</span>
              <p>Checking availability…</p>
            </div>
          )}

          {!isCheckingAvailability && availabilityCheckedAt && !submissionError && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-700/70 bg-emerald-900/40 px-3 py-2.5 text-sm text-emerald-100">
              <span className="mt-0.5 text-base">✓</span>
              <p>Availability updated for your selected date and time.</p>
            </div>
          )}

          {submissionError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-700/70 bg-red-900/50 px-3 py-2.5 text-sm text-red-100">
              <span className="mt-0.5 text-base">!</span>
              <p>{submissionError}</p>
            </div>
          )}

          {!date || !time ? (
            <div className="flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-300">
              <span className="mt-0.5 text-xs text-slate-500">i</span>
              <p>Select date and time to check table availability.</p>
            </div>
          ) : null}
        </div>

        <section className="mt-2 space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-3 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Selected table
          </p>
          {selectedTable ? (
            <>
              <p className="text-sm text-slate-100">
                {selectedTable.label}{' '}
                <span className="text-slate-400">· up to {selectedTable.capacity} guests</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-amber-300">
                  Guest count exceeds table capacity. Reduce guests or choose a larger table.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  You can adjust your party size or pick a different table before confirming.
                </p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-slate-400">
              Tap a table on the floor plan to select it. Only available tables can be chosen.
            </p>
          )}
        </section>
      </div>

      <div className="pt-1">
        <Button
          type="button"
          className="w-full py-2.5 text-sm font-semibold shadow-md shadow-emerald-900/40"
          disabled={!canProceed}
          variant="primary"
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Booking...' : 'Continue to booking'}
        </Button>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          You&apos;ll review and confirm your reservation details on the next step.
        </p>
      </div>
    </div>
  );
}
