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
    <div className="space-y-5 rounded-xl border border-border bg-booking p-5 shadow-sm">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Step 1 · Choose date &amp; time
        </p>
        <h2 className="text-base font-semibold text-foreground">Plan your visit</h2>
        <p className="text-sm text-muted">
          Start by selecting when you&apos;d like to arrive and how many guests are coming.
        </p>
      </header>

      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground" htmlFor="res-date">
              Date <span className="ml-2 text-[11px] font-normal text-muted">(calendar)</span>
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8 2v2M16 2v2M3.5 9h17M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 13.5h3M7.5 16.5h3M13.5 13.5h3M13.5 16.5h3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id="res-date"
                type="date"
                title="Select a date"
                className="h-11 w-full cursor-pointer rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground transition-colors hover:bg-background hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground" htmlFor="res-time">
              Time <span className="ml-2 text-[11px] font-normal text-muted">(picker)</span>
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id="res-time"
                type="time"
                title="Select a time"
                className="h-11 w-full cursor-pointer rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground transition-colors hover:bg-background hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground" htmlFor="res-guests">
            Guests
          </label>
          <input
            id="res-guests"
            type="number"
            min={1}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-background hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          {isCheckingAvailability && (
            <div className="flex items-start gap-2 rounded-lg bg-background px-3 py-2.5 text-sm text-muted">
              <span className="mt-0.5 text-xs text-muted">●</span>
              <p>Checking availability…</p>
            </div>
          )}

          {!isCheckingAvailability && availabilityCheckedAt && !submissionError && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/12 px-3 py-2.5 text-sm text-primary-hover">
              <span className="mt-0.5 text-base">✓</span>
              <p>Availability updated for your selected date and time.</p>
            </div>
          )}

          {submissionError && (
            <div className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
              <span className="mt-0.5 text-base">!</span>
              <p>{submissionError}</p>
            </div>
          )}

          {!date || !time ? (
            <div className="flex items-start gap-2 rounded-lg bg-background px-3 py-2.5 text-sm text-muted">
              <span className="mt-0.5 text-xs text-muted">i</span>
              <p>Select date and time to check table availability.</p>
            </div>
          ) : null}
        </div>

        <section className="mt-2 space-y-1.5 rounded-lg border border-border bg-background px-3 py-3 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Selected table
          </p>
          {selectedTable ? (
            <>
              <p className="text-sm text-foreground">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary-hover">
                    ✓
                  </span>
                  {selectedTable.label}
                </span>{' '}
                <span className="text-muted">· up to {selectedTable.capacity} guests</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-error">
                  This party size may exceed table capacity. Adjust guests or choose another table.
                </p>
              ) : (
                <p className="text-[11px] text-muted">
                  Selected for your chosen time. You can still adjust guests before confirming.
                </p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-muted">
              Tap a table on the floor plan to select it. Only available tables can be chosen.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
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
        <div className="space-y-1 text-center text-[11px] text-muted">
          <p>You&apos;ll review all reservation details on the next step before confirming.</p>
          <p>Instant confirmation, with your QR code and full details, will be shown after booking.</p>
          <p>You can later view and cancel your reservation from the “My reservations” page.</p>
        </div>
      </div>
    </div>
  );
}
