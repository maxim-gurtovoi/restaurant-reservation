'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { cn } from '@/lib/utils';

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function buildMonthCells(monthStart: DateTime): (DateTime | null)[] {
  const start = monthStart.startOf('month');
  const end = monthStart.endOf('month');
  const padBefore = (start.weekday + 6) % 7;
  const cells: (DateTime | null)[] = [];
  for (let i = 0; i < padBefore; i += 1) cells.push(null);
  let d = start;
  while (d <= end) {
    cells.push(d);
    d = d.plus({ days: 1 });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const controlSelectClass =
  'h-9 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-border-strong/50 bg-surface py-0 pl-2.5 pr-9 text-sm font-medium text-foreground shadow-card-soft transition-colors hover:border-border-strong/80 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/35';

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
      viewBox="0 0 24 24"
      fill="none">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type BookingMiniCalendarProps = {
  valueYmd: string;
  timeZone: string;
  minYmd: string;
  maxYmd: string;
  onSelectYmd: (ymd: string) => void;
};

export function BookingMiniCalendar({
  valueYmd,
  timeZone,
  minYmd,
  maxYmd,
  onSelectYmd,
}: BookingMiniCalendarProps) {
  const minDt = useMemo(
    () => DateTime.fromISO(minYmd, { zone: timeZone }).startOf('day'),
    [minYmd, timeZone],
  );
  const maxDt = useMemo(
    () => DateTime.fromISO(maxYmd, { zone: timeZone }).startOf('day'),
    [maxYmd, timeZone],
  );

  const clampMonth = useCallback(
    (m: DateTime) => {
      const v = m.setZone(timeZone).startOf('month');
      if (v < minDt.startOf('month')) return minDt.startOf('month');
      if (v > maxDt.startOf('month')) return maxDt.startOf('month');
      return v;
    },
    [timeZone, minDt, maxDt],
  );

  const selected = useMemo(() => {
    if (!valueYmd) return null;
    const d = DateTime.fromISO(valueYmd, { zone: timeZone });
    return d.isValid ? d.startOf('day') : null;
  }, [valueYmd, timeZone]);

  const [viewMonth, setViewMonth] = useState(() =>
    clampMonth(selected ?? DateTime.now().setZone(timeZone)),
  );

  // `viewMonth` is a hybrid piece of state: it advances independently when the
  // user navigates with the arrows / selects, but must also follow `valueYmd`
  // when the parent changes the selected date programmatically (e.g. the
  // "today" / "tomorrow" quick chips). A `key`-based reset only covers the
  // case where the new `valueYmd` is in a different month at mount time, so
  // we keep this narrow sync here. The functional updater guards against
  // redundant renders when the month is already correct.
  useEffect(() => {
    if (!valueYmd) return;
    const d = DateTime.fromISO(valueYmd, { zone: timeZone });
    if (!d.isValid) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewMonth((prev) => {
      const next = clampMonth(d.startOf('month'));
      return prev.hasSame(next, 'month') ? prev : next;
    });
  }, [valueYmd, timeZone, clampMonth]);

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const rows = useMemo(() => {
    const out: (DateTime | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [cells]);

  const canPrevMonth = viewMonth.startOf('month') > minDt.startOf('month');
  const canNextMonth = viewMonth.startOf('month') < maxDt.startOf('month');

  const yearOptions = useMemo(() => {
    const ys: number[] = [];
    for (let y = minDt.year; y <= maxDt.year; y += 1) ys.push(y);
    return ys;
  }, [minDt, maxDt]);

  const bumpMonth = (delta: number) => {
    setViewMonth((v) => clampMonth(v.plus({ months: delta })));
  };

  return (
    <div className="rounded-2xl border border-border-strong/40 bg-surface-soft/80 p-3 shadow-card-soft sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canPrevMonth}
            aria-label="Предыдущий месяц"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-lg text-foreground transition-colors',
              canPrevMonth
                ? 'hover:border-border-strong/55 hover:bg-surface'
                : 'cursor-not-allowed opacity-35',
            )}
            onClick={() => bumpMonth(-1)}>
            ‹
          </button>
          <button
            type="button"
            disabled={!canNextMonth}
            aria-label="Следующий месяц"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-lg text-foreground transition-colors',
              canNextMonth
                ? 'hover:border-border-strong/55 hover:bg-surface'
                : 'cursor-not-allowed opacity-35',
            )}
            onClick={() => bumpMonth(1)}>
            ›
          </button>
        </div>

        <div className="flex flex-1 flex-wrap items-stretch gap-2 sm:justify-end">
          <div className="relative flex-1 sm:max-w-[11rem]">
            <label className="sr-only" htmlFor="res-cal-month">
              Месяц
            </label>
            <select
              id="res-cal-month"
              className={controlSelectClass}
              value={viewMonth.month}
              onChange={(e) => {
                const month = Number(e.target.value);
                setViewMonth((v) => clampMonth(v.set({ month })));
              }}>
              {MONTH_NAMES_RU.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          <div className="relative w-[5.75rem] shrink-0">
            <label className="sr-only" htmlFor="res-cal-year">
              Год
            </label>
            <select
              id="res-cal-year"
              className={controlSelectClass}
              value={viewMonth.year}
              onChange={(e) => {
                const year = Number(e.target.value);
                setViewMonth((v) => clampMonth(v.set({ year })));
              }}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border border-border/40 bg-surface p-2 sm:p-3"
        role="grid"
        aria-label="Календарь выбора даты">
        <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS_RU.map((d) => (
            <div key={d} className="py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {d}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {rows.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((cell, di) => {
                const key = cell ? cell.toISODate() ?? `c-${wi}-${di}` : `x-${wi}-${di}`;
                if (!cell) {
                  return <div key={key} className="aspect-square max-h-10" aria-hidden />;
                }
                const ymd = cell.toFormat('yyyy-LL-dd');
                const day = cell.day;
                const isBeforeMin = cell < minDt;
                const isAfterMax = cell > maxDt;
                const disabled = isBeforeMin || isAfterMax;
                const isToday = cell.hasSame(DateTime.now().setZone(timeZone), 'day');
                const isSelected = selected !== null && selected.hasSame(cell, 'day');

                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    disabled={disabled}
                    aria-selected={isSelected}
                    aria-label={cell.setLocale('ru').toFormat('d MMMM yyyy')}
                    className={cn(
                      'aspect-square max-h-10 rounded-lg text-sm font-medium tabular-nums transition-colors',
                      disabled && 'cursor-not-allowed text-muted/45',
                      !disabled &&
                        !isSelected &&
                        'text-foreground hover:bg-accent-bg/50 hover:text-accent-text',
                      isToday && !isSelected && !disabled && 'ring-1 ring-primary/35',
                      isSelected &&
                        'bg-primary text-white ring-2 ring-primary/40 ring-offset-2 ring-offset-surface',
                    )}
                    onClick={() => {
                      if (!disabled) onSelectYmd(ymd);
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
