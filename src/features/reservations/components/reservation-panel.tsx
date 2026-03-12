'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type SelectedTableInfo = {
  label: string;
  capacity: number;
} | null;

type ReservationPanelProps = {
  selectedTable: SelectedTableInfo;
};

export function ReservationPanel({ selectedTable }: ReservationPanelProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);

  const exceedsCapacity =
    selectedTable != null && guests > selectedTable.capacity;

  const canProceed = !!selectedTable && !exceedsCapacity && date && time;

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Plan your reservation
      </h2>

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
            onChange={(e) => setDate(e.target.value)}
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
            onChange={(e) => setTime(e.target.value)}
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
            onChange={(e) => setGuests(Number(e.target.value) || 1)}
          />
        </div>

        <div className="mt-3 space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <p className="font-medium text-slate-200">Selected table</p>
          {selectedTable ? (
            <>
              <p className="text-slate-300">
                {selectedTable.label}{' '}
                <span className="text-slate-500">
                  · up to {selectedTable.capacity} guests
                </span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-amber-400">
                  Guest count exceeds table capacity. Consider reducing guests
                  or choosing a larger table.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-slate-500">
              Tap a table on the floor plan to select it.
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!canProceed}
        variant="primary"
      >
        Continue to booking
      </Button>
    </div>
  );
}

