'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TableShape } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { useReservationAvailability } from '@/features/reservations/hooks/use-reservation-availability';
import { isValidBookingPhone, normalizePhoneDigits } from '@/lib/guest-contact';
import { cn } from '@/lib/utils';

type ReserveRestaurant = {
  id: string;
  name: string;
  slug: string;
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

const inputClass =
  'h-11 w-full rounded-xl border border-border-strong/55 bg-surface px-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

const inputWithIconClass =
  'h-11 w-full cursor-pointer rounded-xl border border-border-strong/55 bg-surface pl-10 pr-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

function formatDateRu(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map((n) => Number(n));
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const STEPS = [
  { id: 1, label: 'Параметры' },
  { id: 2, label: 'Столик' },
  { id: 3, label: 'Подтверждение' },
] as const;

export function RestaurantReserveFlow({
  restaurant,
  isLoggedIn,
  accountProfile,
}: {
  restaurant: ReserveRestaurant;
  isLoggedIn: boolean;
  accountProfile: { name: string; phone: string | null } | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    if (isLoggedIn && accountProfile) {
      setContactName(accountProfile.name.trim());
      setContactPhone(accountProfile.phone?.trim() ?? '');
    } else if (!isLoggedIn) {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
    }
  }, [isLoggedIn, accountProfile]);

  const clearTableIfUnavailable = useCallback(() => {
    setSelectedTableId(null);
  }, []);

  const {
    unavailableTableIds,
    isCheckingAvailability,
    availabilityCheckedAt,
    availabilityError,
  } = useReservationAvailability({
    restaurantId: restaurant.id,
    date,
    time,
    selectedTableId,
    onSelectedTableCleared: clearTableIfUnavailable,
  });

  const selectedTable = restaurant.tables.find((t) => t.id === selectedTableId) ?? null;
  const exceedsCapacity = selectedTable != null && guests > selectedTable.capacity;
  const activeTablesCount = restaurant.tables.filter((t) => t.isActive).length;

  const canGoToTableStep = Boolean(date && time && guests >= 1);
  const canGoToConfirm =
    Boolean(selectedTable && !exceedsCapacity && date && time) && activeTablesCount > 0;

  const profilePhoneDigits = accountProfile?.phone
    ? normalizePhoneDigits(accountProfile.phone)
    : '';
  const effectiveName =
    (contactName.trim() || accountProfile?.name.trim() || '').trim();
  const effectivePhoneDigits = normalizePhoneDigits(
    contactPhone || (isLoggedIn ? profilePhoneDigits : '') || '',
  );
  const contactsReadyForSubmit =
    effectiveName.length >= 2 &&
    effectivePhoneDigits.length >= 10 &&
    isValidBookingPhone(effectivePhoneDigits);

  const handleConfirm = async () => {
    if (!selectedTable || !canGoToConfirm || !contactsReadyForSubmit) return;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const params = new URLSearchParams({
        restaurantId: restaurant.id,
        date,
        time,
      });
      const avRes = await fetch(`/api/reservations/availability?${params}`);
      if (avRes.ok) {
        const av = (await avRes.json()) as { unavailableTableIds?: string[] };
        const blocked = av.unavailableTableIds ?? [];
        if (blocked.includes(selectedTable.id)) {
          throw new Error(
            'Столик только что заняли на это время. Вернитесь к выбору столика и выберите другой.',
          );
        }
      }

      const payload: Record<string, unknown> = {
        restaurantId: restaurant.id,
        tableId: selectedTable.id,
        date,
        time,
        guestCount: guests,
        contactName: effectiveName,
        contactPhone: effectivePhoneDigits || contactPhone,
        contactEmail: contactEmail.trim() || undefined,
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          typeof errorData?.error === 'string' ? errorData.error : 'Не удалось создать бронь',
        );
      }

      const result = (await response.json()) as { id: string; qrToken: string };
      if (isLoggedIn) {
        router.push(`/reservations/${result.id}`);
      } else {
        router.push(
          `/reservations/${result.id}?token=${encodeURIComponent(result.qrToken)}`,
        );
      }
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать бронь';
      setSubmissionError(message);
      console.error('Error submitting reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasProfilePhone =
    Boolean(accountProfile?.phone?.trim()) &&
    isValidBookingPhone(normalizePhoneDigits(accountProfile.phone!));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <nav aria-label="Шаги бронирования" className="rounded-2xl border border-border/50 bg-surface p-4 shadow-card-soft">
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2 sm:flex-col sm:items-stretch sm:text-center">
                <div className="flex items-center gap-2 sm:justify-center">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isActive && 'bg-primary text-primary-foreground shadow-sm',
                      isDone && 'bg-accent-bg text-accent-text ring-1 ring-accent-border/60',
                      !isActive && !isDone && 'bg-surface-soft text-muted ring-1 ring-border/60',
                    )}>
                    {isDone ? '\u2713' : s.id}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium sm:hidden',
                      isActive ? 'text-foreground' : 'text-muted',
                    )}>
                    {s.label}
                  </span>
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    isActive ? 'text-foreground' : 'text-muted',
                  )}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {step === 1 && (
        <section className="space-y-5 rounded-2xl border border-border/50 bg-surface p-5 shadow-card sm:p-6">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
              Шаг 1
            </p>
            <h2 className="text-lg font-semibold text-foreground">Дата, время и гости</h2>
            <p className="text-sm text-muted">
              Выберите день визита, время прихода и размер компании.
            </p>
          </header>

          <div className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground" htmlFor="res-date">
                  Дата
                </label>
                <div className="relative">
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    viewBox="0 0 24 24"
                    fill="none">
                    <path
                      d="M8 2v2M16 2v2M3.5 9h17M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    id="res-date"
                    type="date"
                    title="Выберите дату"
                    className={inputWithIconClass}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground" htmlFor="res-time">
                  Время
                </label>
                <div className="relative">
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    viewBox="0 0 24 24"
                    fill="none">
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
                    title="Выберите время"
                    className={inputWithIconClass}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground" htmlFor="res-guests">
                Число гостей
              </label>
              <input
                id="res-guests"
                type="number"
                min={1}
                className={inputClass}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={!canGoToTableStep}
              onClick={() => setStep(2)}>
              Далее: выбор столика
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-border/50 bg-surface p-5 shadow-card sm:p-6">
            <header className="mb-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
                Шаг 2
              </p>
              <h2 className="text-lg font-semibold text-foreground">Выбор столика на плане</h2>
              <p className="text-sm text-muted">
                Доступность учтена для{' '}
                <span className="font-medium text-foreground">
                  {date && time ? `${formatDateRu(date)}, ${time}` : '…'}
                </span>
                , гостей: <span className="font-medium text-foreground">{guests}</span>.
              </p>
            </header>

            {isCheckingAvailability && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-border/50 bg-surface-soft px-3 py-2.5 text-sm text-muted">
                <span className="mt-0.5">●</span>
                <p>Проверяем доступность…</p>
              </div>
            )}

            {!isCheckingAvailability && availabilityCheckedAt && !availabilityError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent-border/60 bg-accent-bg/50 px-3 py-2.5 text-sm text-accent-text">
                <span className="mt-0.5">{'\u2713'}</span>
                <p>Свободные столики отмечены на схеме; занятые отображаются бледнее.</p>
              </div>
            )}

            {availabilityError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-error/25 bg-error/8 px-3 py-2.5 text-sm text-error">
                <span className="mt-0.5">!</span>
                <p>{availabilityError}</p>
              </div>
            )}

            {!activeTablesCount && (
              <div className="mb-4 rounded-xl border border-border/50 bg-surface-soft px-3 py-2.5 text-sm text-muted">
                Для этого ресторана пока нет активных столиков.
              </div>
            )}

            <FloorPlanView
              floorPlans={restaurant.floorPlans}
              tables={restaurant.tables}
              selectedTableId={selectedTableId}
              unavailableTableIds={unavailableTableIds}
              onSelectTable={setSelectedTableId}
              restaurantSlug={restaurant.slug}
              headerEyebrow="План зала"
            />

            {selectedTable && exceedsCapacity && (
              <p className="mt-4 text-sm text-error">
                Стол {selectedTable.label} вмещает до {selectedTable.capacity} гостей. Уменьшите число
                гостей или выберите другой стол.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                Назад
              </Button>
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={!canGoToConfirm}
                onClick={() => setStep(3)}>
                Далее: проверка и подтверждение
              </Button>
            </div>
          </section>
        </div>
      )}

      {step === 3 && (
        <section className="space-y-6 rounded-2xl border border-accent-border/50 bg-booking p-5 shadow-card-strong sm:p-6">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
              Шаг 3
            </p>
            <h2 className="text-lg font-semibold text-foreground">Проверьте детали брони</h2>
            <p className="text-sm text-muted">
              После подтверждения откроется страница с QR-кодом. Без аккаунта сохраните ссылку из
              адресной строки.
            </p>
          </header>

          <dl className="grid gap-3 rounded-xl border border-border/50 bg-surface px-4 py-4 text-sm shadow-card-soft sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Ресторан</dt>
              <dd className="mt-0.5 font-medium text-foreground">{restaurant.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Дата</dt>
              <dd className="mt-0.5 capitalize text-foreground">{date ? formatDateRu(date) : '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Время</dt>
              <dd className="mt-0.5 text-foreground">{time || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Гости</dt>
              <dd className="mt-0.5 text-foreground">{guests}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Столик</dt>
              <dd className="mt-0.5 text-foreground">
                {selectedTable ? (
                  <>
                    <span className="font-semibold">{selectedTable.label}</span>
                    <span className="text-muted"> · до {selectedTable.capacity} мест</span>
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>

          <div className="space-y-4 rounded-xl border border-border/50 bg-surface px-4 py-4 text-sm shadow-card-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Контакт для брони</p>

            {isLoggedIn && hasProfilePhone ? (
              <p className="text-sm text-foreground">
                <span className="text-muted">Имя и телефон из профиля: </span>
                <span className="font-medium">{effectiveName}</span>
                {', '}
                <span className="font-medium">{accountProfile.phone}</span>
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground" htmlFor="res-contact-name">
                    Имя <span className="text-error">*</span>
                  </label>
                  <input
                    id="res-contact-name"
                    type="text"
                    autoComplete="name"
                    className={inputClass}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Как к вам обращаться"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground" htmlFor="res-contact-phone">
                    Телефон <span className="text-error">*</span>
                  </label>
                  <input
                    id="res-contact-phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputClass}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+373 …"
                  />
                  {isLoggedIn && !accountProfile?.phone ? (
                    <p className="text-xs text-muted">
                      В профиле нет телефона — укажите номер для связи по этой брони.
                    </p>
                  ) : null}
                </div>
                {!isLoggedIn ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-foreground" htmlFor="res-contact-email">
                      Email <span className="text-muted">(необязательно)</span>
                    </label>
                    <input
                      id="res-contact-email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Для напоминаний"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>

          {submissionError ? (
            <div className="rounded-xl border border-error/25 bg-error/8 px-3 py-2.5 text-sm text-error">
              {submissionError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setStep(2)}>
              Назад к плану
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={!canGoToConfirm || isSubmitting || !contactsReadyForSubmit}
              onClick={() => void handleConfirm()}>
              {isSubmitting ? 'Отправка…' : 'Подтвердить бронь'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
