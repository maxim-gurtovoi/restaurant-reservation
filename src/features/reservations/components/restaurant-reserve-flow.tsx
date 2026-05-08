'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FloorPlanElementType, TableShape } from '@prisma/client';
import { DateTime } from 'luxon';
import { Button } from '@/components/ui/button';
import { BookingMiniCalendar } from '@/features/reservations/components/booking-mini-calendar';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { useReservationAvailability } from '@/features/reservations/hooks/use-reservation-availability';
import {
  buildReservationTimeSlots,
  minBookableDateTimeInZone,
  ymdInZone,
} from '@/features/reservations/lib/booking-datetime-ui';
import {
  BOOKING_LEAD_MINUTES,
  RESERVATION_DURATION_MINUTES,
} from '@/features/reservations/reservation-window';
import { isValidBookingPhone, normalizePhoneDigits } from '@/lib/guest-contact';
import { cn } from '@/lib/utils';

const TIME_SLOT_STEP_MIN = 15;

type ReserveRestaurant = {
  id: string;
  name: string;
  slug: string;
  workingHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
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
  floorPlanElements: {
    id: string;
    floorPlanId: string;
    type: FloorPlanElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    label: string | null;
  }[];
};

const inputClass =
  'h-11 w-full rounded-xl border border-border-strong/55 bg-surface px-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

const inputWithIconClass =
  'h-11 w-full cursor-pointer rounded-xl border border-border-strong/55 bg-surface pl-10 pr-3 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

const selectClass =
  'h-11 w-full cursor-pointer appearance-none rounded-xl border border-border-strong/55 bg-surface px-3 pr-10 text-sm text-foreground shadow-card-soft transition-colors hover:border-border-strong/75 focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent-border/40 disabled:cursor-not-allowed disabled:opacity-60';

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

const RESERVE_DRAFT_VERSION = 1;

function reserveDraftStorageKey(slug: string) {
  return `tableflow:reserveDraft:${slug}`;
}

function tryShowPicker(el: HTMLInputElement | null) {
  const extended = el as (HTMLInputElement & { showPicker?: () => void }) | null;
  extended?.showPicker?.();
}

function readReserveDraft(params: {
  restaurant: ReserveRestaurant;
  bookingTimeZone: string;
}) {
  const { restaurant, bookingTimeZone } = params;
  const key = reserveDraftStorageKey(restaurant.slug);
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as {
      v?: number;
      restaurantId?: string;
      step?: number;
      selectedTableId?: string | null;
      date?: string;
      time?: string;
      showCustomTime?: boolean;
      guests?: number;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
    };
    if (p.v !== RESERVE_DRAFT_VERSION || p.restaurantId !== restaurant.id) return null;

    const maxBookingYmdLocal = ymdInZone(
      bookingTimeZone,
      DateTime.now().setZone(bookingTimeZone).plus({ days: 90 }),
    );
    const caps = restaurant.tables.filter((t) => t.isActive).map((t) => t.capacity);
    const maxTableCap = caps.length > 0 ? Math.max(...caps) : 8;
    const maxGuestOpt = Math.min(20, Math.max(10, maxTableCap));
    const activeTables = restaurant.tables.filter((t) => t.isActive).length;

    let dateVal = typeof p.date === 'string' ? p.date : '';
    let timeVal = typeof p.time === 'string' ? p.time : '';
    if (timeVal && !/^\d{1,2}:\d{2}$/.test(timeVal)) {
      timeVal = '';
    } else if (timeVal) {
      const [hh, mm] = timeVal.split(':').map((n) => Number(n));
      if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        timeVal = '';
      }
    }

    const d = DateTime.fromISO(dateVal, { zone: bookingTimeZone });
    const todayStart = DateTime.now().setZone(bookingTimeZone).startOf('day');
    const maxD = DateTime.fromISO(maxBookingYmdLocal, { zone: bookingTimeZone });
    if (!dateVal || !d.isValid || d < todayStart || d > maxD) {
      dateVal = '';
      timeVal = '';
    }

    let guestsVal =
      typeof p.guests === 'number' && Number.isFinite(p.guests) ? Math.round(p.guests) : 2;
    guestsVal = Math.min(Math.max(1, guestsVal), maxGuestOpt);

    let tableId =
      typeof p.selectedTableId === 'string' && p.selectedTableId
        ? p.selectedTableId
        : null;
    if (
      tableId &&
      !restaurant.tables.some((t) => t.id === tableId && t.isActive)
    ) {
      tableId = null;
    }

    let stepVal: 1 | 2 | 3 = 1;
    if (p.step === 2 || p.step === 3) stepVal = p.step;

    const canTable = Boolean(dateVal && timeVal && guestsVal >= 1);
    if (stepVal >= 2 && !canTable) stepVal = 1;

    const sel = tableId ? restaurant.tables.find((t) => t.id === tableId) : null;
    const exceeds = sel != null && guestsVal > sel.capacity;
    const canConfirm = Boolean(sel && !exceeds && dateVal && timeVal) && activeTables > 0;
    if (stepVal >= 3 && !canConfirm) stepVal = 2;
    if (stepVal >= 2 && !canTable) stepVal = 1;

    return {
      stepVal,
      tableId,
      dateVal,
      timeVal,
      showCustomTimeVal: Boolean(p.showCustomTime),
      guestsVal,
      contactName: typeof p.contactName === 'string' ? p.contactName : null,
      contactPhone: typeof p.contactPhone === 'string' ? p.contactPhone : null,
      contactEmail: typeof p.contactEmail === 'string' ? p.contactEmail : null,
    };
  } catch {
    return null;
  }
}

export function RestaurantReserveFlow({
  restaurant,
  bookingTimeZone,
  isLoggedIn,
  accountProfile,
}: {
  restaurant: ReserveRestaurant;
  /** Resolved IANA zone (same rule as server `getRestaurantIanaZone`). */
  bookingTimeZone: string;
  isLoggedIn: boolean;
  accountProfile: { name: string; phone: string | null } | null;
}) {
  const router = useRouter();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [contactName, setContactName] = useState(() =>
    isLoggedIn && accountProfile ? accountProfile.name.trim() : '',
  );
  const [contactPhone, setContactPhone] = useState(() =>
    isLoggedIn && accountProfile ? (accountProfile.phone?.trim() ?? '') : '',
  );
  const [contactEmail, setContactEmail] = useState('');
  const restoreSignature = `${restaurant.id}|${restaurant.slug}|${bookingTimeZone}`;
  const [appliedRestoreSignature, setAppliedRestoreSignature] = useState('');
  if (appliedRestoreSignature !== restoreSignature) {
    setAppliedRestoreSignature(restoreSignature);
    const draft = readReserveDraft({ restaurant, bookingTimeZone });
    if (draft) {
      setStep(draft.stepVal);
      setSelectedTableId(draft.tableId);
      setDate(draft.dateVal);
      setTime(draft.timeVal);
      setShowCustomTime(draft.showCustomTimeVal);
      setGuests(draft.guestsVal);
      if (draft.contactName !== null) setContactName(draft.contactName);
      if (draft.contactPhone !== null) setContactPhone(draft.contactPhone);
      if (draft.contactEmail !== null) setContactEmail(draft.contactEmail);
    } else {
      setStep(1);
      setSelectedTableId(null);
      setDate('');
      setTime('');
      setShowCustomTime(false);
      setGuests(2);
      setContactName(isLoggedIn && accountProfile ? accountProfile.name.trim() : '');
      setContactPhone(isLoggedIn && accountProfile ? (accountProfile.phone?.trim() ?? '') : '');
      setContactEmail('');
    }
  }

  useEffect(() => {
    const key = reserveDraftStorageKey(restaurant.slug);
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          v: RESERVE_DRAFT_VERSION,
          restaurantId: restaurant.id,
          step,
          selectedTableId,
          date,
          time,
          showCustomTime,
          guests,
          contactName,
          contactPhone,
          contactEmail,
        }),
      );
    } catch {
      /* quota / private mode */
    }
  }, [
    restaurant.id,
    restaurant.slug,
    step,
    selectedTableId,
    date,
    time,
    showCustomTime,
    guests,
    contactName,
    contactPhone,
    contactEmail,
  ]);

  // Sync contact fields when the auth state changes mid-flow (user logs in
  // through the header modal, or signs out). We use React's "adjust state
  // while rendering" pattern rather than `useEffect`: it avoids the
  // cascading-render warning and keeps the form in lock-step with props
  // without an extra commit. See:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const authSignature = isLoggedIn
    ? `in:${accountProfile?.name ?? ''}|${accountProfile?.phone ?? ''}`
    : 'out';
  const [prevAuthSignature, setPrevAuthSignature] = useState(authSignature);
  if (authSignature !== prevAuthSignature) {
    setPrevAuthSignature(authSignature);
    if (isLoggedIn && accountProfile) {
      setContactName(accountProfile.name.trim());
      setContactPhone(accountProfile.phone?.trim() ?? '');
    } else if (!isLoggedIn) {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
    }
  }

  const todayYmd = ymdInZone(bookingTimeZone);
  const tomorrowYmd = ymdInZone(
    bookingTimeZone,
    DateTime.now().setZone(bookingTimeZone).plus({ days: 1 }),
  );
  const afterTomorrowYmd = ymdInZone(
    bookingTimeZone,
    DateTime.now().setZone(bookingTimeZone).plus({ days: 2 }),
  );
  const maxBookingYmd = ymdInZone(
    bookingTimeZone,
    DateTime.now().setZone(bookingTimeZone).plus({ days: 90 }),
  );

  const maxTableCapacity = useMemo(() => {
    const caps = restaurant.tables.filter((t) => t.isActive).map((t) => t.capacity);
    return caps.length > 0 ? Math.max(...caps) : 8;
  }, [restaurant.tables]);

  const guestOptions = useMemo(() => {
    const hi = Math.min(20, Math.max(10, maxTableCapacity));
    return Array.from({ length: hi }, (_, i) => i + 1);
  }, [maxTableCapacity]);

  const slotPlan = useMemo(() => {
    if (!date) {
      return {
        slots: [] as string[],
        dayClosed: false,
        scheduleMissing: false,
        manualOnly: false,
      };
    }
    const notBefore =
      date === todayYmd
        ? minBookableDateTimeInZone(bookingTimeZone, BOOKING_LEAD_MINUTES)
        : null;
    return buildReservationTimeSlots({
      isoDate: date,
      timeZone: bookingTimeZone,
      workingHours: restaurant.workingHours,
      slotStepMinutes: TIME_SLOT_STEP_MIN,
      reservationDurationMinutes: RESERVATION_DURATION_MINUTES,
      notBeforeInZone: notBefore,
    });
  }, [date, bookingTimeZone, restaurant.workingHours, todayYmd]);

  // Invalidate `time` when the available slot list no longer contains it
  // (happens when `date` changes and the new day has a different schedule).
  // Using a ref-equality check on `slotPlan.slots`: `useMemo` preserves the
  // array reference while its dependencies stay the same, so this cheaply
  // detects real recomputations.
  const [prevSlotsRef, setPrevSlotsRef] = useState(slotPlan.slots);
  if (prevSlotsRef !== slotPlan.slots) {
    setPrevSlotsRef(slotPlan.slots);
    if (!showCustomTime && time && !slotPlan.slots.includes(time)) {
      setTime('');
    }
  }

  // For effectively-24/7 shifts the slot grid would balloon to 80+ entries — the
  // slot generator flags them as `manualOnly` and we default to the manual input.
  if (slotPlan.manualOnly && !showCustomTime) {
    setShowCustomTime(true);
  }

  // Clamp `guests` to the current max. `guestOptions` depends on static
  // restaurant data within a booking flow, so this almost never fires; it's
  // kept as a guard against future dynamic inputs. Safe to run during render
  // because the guard makes this idempotent.
  const maxGuestOption = guestOptions[guestOptions.length - 1] ?? 1;
  if (guests > maxGuestOption) {
    setGuests(maxGuestOption);
  }

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
      try {
        sessionStorage.removeItem(reserveDraftStorageKey(restaurant.slug));
      } catch {
        /* ignore */
      }
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

  const profilePhoneTrimmed = accountProfile?.phone?.trim() ?? '';
  const hasProfilePhone =
    profilePhoneTrimmed.length > 0 &&
    isValidBookingPhone(normalizePhoneDigits(profilePhoneTrimmed));

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
              Выберите дату и время визита, а также количество гостей.
            </p>
          </header>

          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { ymd: todayYmd, label: 'Сегодня' },
                    { ymd: tomorrowYmd, label: 'Завтра' },
                    { ymd: afterTomorrowYmd, label: 'Послезавтра' },
                  ] as const
                ).map(({ ymd, label }) => (
                  <button
                    key={ymd}
                    type="button"
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      date === ymd
                        ? 'border-accent-text bg-accent-bg text-accent-text ring-1 ring-accent-border/50'
                        : 'border-border-strong/55 bg-surface-soft text-foreground hover:border-border-strong/75',
                    )}
                    onClick={() => {
                      setDate(ymd);
                      setShowCustomTime(false);
                    }}>
                    {label}
                  </button>
                ))}
              </div>
              <BookingMiniCalendar
                valueYmd={date}
                timeZone={bookingTimeZone}
                minYmd={todayYmd}
                maxYmd={maxBookingYmd}
                onSelectYmd={(ymd) => {
                  setDate(ymd);
                  setShowCustomTime(false);
                }}
              />
            </div>

            <div className="space-y-2 border-t border-border/50 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">Время визита</span>
                {slotPlan.scheduleMissing && date && !slotPlan.dayClosed ? (
                  <span className="text-[11px] text-muted">Подсказка по типовым часам</span>
                ) : null}
              </div>

              {!date ? (
                <p className="text-sm text-muted">Сначала выберите дату — появятся допустимые интервалы.</p>
              ) : slotPlan.dayClosed ? (
                <p className="text-sm text-error">
                  По графику ресторан не работает в выбранный день. Выберите другую дату.
                </p>
              ) : slotPlan.manualOnly ? (
                <p className="text-sm text-muted">
                  Ресторан работает круглосуточно — укажите удобное время вручную ниже.
                </p>
              ) : slotPlan.slots.length === 0 ? (
                <p className="text-sm text-muted">
                  На этот день не осталось доступных интервалов с учётом длительности визита и запаса по
                  времени. Попробуйте завтра или другую дату.
                </p>
              ) : (
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Доступное время визита">
                  {slotPlan.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={cn(
                        'min-w-17 rounded-lg border px-2.5 py-2 text-sm font-medium tabular-nums transition-colors',
                        time === slot && !showCustomTime
                          ? 'border-accent-text bg-accent-bg text-accent-text shadow-sm ring-1 ring-accent-border/45'
                          : 'border-border-strong/55 bg-surface shadow-card-soft hover:border-border-strong/80',
                      )}
                      onClick={() => {
                        setShowCustomTime(false);
                        setTime(slot);
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {slotPlan.manualOnly ? (
                  <span className="text-left text-xs font-semibold text-foreground">
                    Режим 24/7 — время указывается вручную
                  </span>
                ) : (
                  <button
                    type="button"
                    className={cn(
                      'text-left text-xs font-semibold text-accent-text underline-offset-4 hover:underline',
                      showCustomTime && 'text-foreground',
                    )}
                    onClick={() => {
                      setShowCustomTime((v) => !v);
                      if (!showCustomTime) {
                        window.setTimeout(() => {
                          timeInputRef.current?.focus();
                          tryShowPicker(timeInputRef.current);
                        }, 0);
                      }
                    }}>
                    {showCustomTime ? 'Скрыть ручной ввод времени' : 'Ввести время вручную'}
                  </button>
                )}
                {showCustomTime ? (
                  <div className="relative max-w-xs sm:ml-auto">
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
                      ref={timeInputRef}
                      id="res-time-custom"
                      type="time"
                      title="Укажите время"
                      step={60 * TIME_SLOT_STEP_MIN}
                      className={inputWithIconClass}
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      onClick={(e) => tryShowPicker(e.currentTarget)}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground" htmlFor="res-guests">
                Количество гостей
              </label>
              <div className="relative">
                <select
                  id="res-guests"
                  className={selectClass}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}>
                  {guestOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
              </div>
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
              elements={restaurant.floorPlanElements}
              selectedTableId={selectedTableId}
              unavailableTableIds={unavailableTableIds}
              onSelectTable={setSelectedTableId}
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
                <span className="font-medium">{profilePhoneTrimmed}</span>
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
