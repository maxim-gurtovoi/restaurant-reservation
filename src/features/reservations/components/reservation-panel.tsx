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
  availabilityError?: string | null;
  activeTablesCount?: number;
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

const inputClass =
  'h-11 w-full rounded-xl border border-border-strong/55 bg-surface px-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

const inputWithIconClass =
  'h-11 w-full cursor-pointer rounded-xl border border-border-strong/55 bg-surface pl-10 pr-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

export function ReservationPanel({
  date,
  time,
  guests,
  selectedTable,
  restaurantId,
  isCheckingAvailability = false,
  availabilityCheckedAt = null,
  availabilityError = null,
  activeTablesCount = 0,
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
    await onSubmit({ restaurantId, tableId: selectedTable.id, date, time, guestCount: guests });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-accent-border/50 bg-booking p-6 shadow-card-strong">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
          Шаг 1 · Дата и время
        </p>
        <h2 className="text-base font-semibold text-foreground">Спланируйте визит</h2>
        <p className="text-sm text-muted">
          Укажите время прихода и сколько будет гостей.
        </p>
      </header>

      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground" htmlFor="res-date">
              Дата <span className="ml-1 text-[11px] font-normal text-muted">(календарь)</span>
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
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M7.5 13.5h3M7.5 16.5h3M13.5 13.5h3M13.5 16.5h3"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <input
                id="res-date" type="date" title="Выберите дату"
                className={inputWithIconClass}
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground" htmlFor="res-time">
              Время <span className="ml-1 text-[11px] font-normal text-muted">(выбор)</span>
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
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <input
                id="res-time" type="time" title="Выберите время"
                className={inputWithIconClass}
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground" htmlFor="res-guests">
            Гости
          </label>
          <input
            id="res-guests" type="number" min={1}
            className={inputClass}
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          {isCheckingAvailability && (
            <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-surface px-3 py-2.5 text-sm text-muted shadow-card-soft">
              <span className="mt-0.5 text-xs">●</span>
              <p>Проверяем доступность…</p>
            </div>
          )}

          {!isCheckingAvailability && availabilityCheckedAt && !submissionError && !availabilityError && (
            <div className="flex items-start gap-2 rounded-xl border border-accent-border/60 bg-accent-bg/50 px-3 py-2.5 text-sm text-accent-text">
              <span className="mt-0.5 text-base">✓</span>
              <p>Доступность обновлена для выбранных даты и времени.</p>
            </div>
          )}

          {availabilityError && (
            <div className="flex items-start gap-2 rounded-xl border border-accent-border/55 bg-accent-bg/50 px-3 py-2.5 text-sm text-foreground">
              <span className="mt-0.5">!</span>
              <p>{availabilityError}</p>
            </div>
          )}

          {submissionError && (
            <div className="flex items-start gap-2 rounded-xl border border-error/25 bg-error/8 px-3 py-2.5 text-sm text-error">
              <span className="mt-0.5">!</span>
              <p>{submissionError}</p>
            </div>
          )}

          {!activeTablesCount && (
            <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-surface px-3 py-2.5 text-sm text-muted shadow-card-soft">
              <span className="mt-0.5 text-xs">i</span>
              <p>Для этого ресторана пока нет активных столиков.</p>
            </div>
          )}

          {(!date || !time) && (
            <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-surface px-3 py-2.5 text-sm text-muted shadow-card-soft">
              <span className="mt-0.5 text-xs">i</span>
              <p>Укажите дату и время, чтобы проверить занятость столиков.</p>
            </div>
          )}
        </div>

        <section className="space-y-2 rounded-xl border border-border/50 bg-surface px-4 py-3.5 shadow-card-soft">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
            Выбранный столик
          </p>
          {selectedTable ? (
            <>
              <p className="text-sm text-foreground">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-bg text-accent-text text-xs">
                    ✓
                  </span>
                  {selectedTable.label}
                </span>{' '}
                <span className="text-muted">· до {selectedTable.capacity} гостей</span>
              </p>
              {exceedsCapacity ? (
                <p className="text-[11px] text-error">
                  Возможно, гостей больше, чем вмещает стол. Измените число гостей или выберите другой стол.
                </p>
              ) : (
                <p className="text-[11px] text-muted">
                  Выбрано на указанное время. Число гостей можно изменить до подтверждения.
                </p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-muted">
              Нажмите столик на плане зала. Можно выбрать только свободные столики.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-3 border-t border-accent-border/40 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
          Шаг 3 · Перейти к бронированию
        </p>
        <Button
          type="button"
          className="w-full py-2.5 text-sm font-semibold"
          disabled={!canProceed}
          variant="primary"
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Бронирование…' : 'Продолжить к брони'}
        </Button>
        <div className="space-y-1 text-center text-[11px] text-muted">
          <p>На следующем шаге вы сможете проверить все данные перед подтверждением.</p>
          <p>После брони сразу отобразится подтверждение, QR-код и полные детали.</p>
          <p>Позже бронь можно посмотреть или отменить в разделе «Мои брони».</p>
        </div>
      </div>
    </div>
  );
}
