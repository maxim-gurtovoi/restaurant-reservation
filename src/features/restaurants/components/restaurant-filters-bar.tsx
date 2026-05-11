'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { FILTERABLE_FEATURES, type SortOption } from '@/features/restaurants/constants';

const SEARCH_DEBOUNCE_MS = 300;

const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
const PRICE_POSITIONS = [1, 2, 3, 4] as const;

const FEATURE_ICONS: Record<string, string> = {
  TERRACE: '☀️',
  LIVE_MUSIC: '🎵',
  WIFI: '📶',
  PARKING: '🅿️',
  FAMILY_FRIENDLY: '👨‍👩‍👧',
  PET_FRIENDLY: '🐾',
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

function buildURL(
  current: URLSearchParams,
  updates: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current.toString());
  if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
    next.delete('page');
  }
  for (const [key, val] of Object.entries(updates)) {
    if (val === null || val === '') next.delete(key);
    else next.set(key, val);
  }
  const str = next.toString();
  return str ? `/?${str}` : '/';
}

/** Custom 4-point dual-handle price range slider */
function PriceRangeSlider({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const pct = (v: number) => ((v - 1) / 3) * 100;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);
  const cleanupDragRef = useRef<(() => void) | null>(null);
  /** During drag: local UI only; URL updates once on pointerup. */
  const isDraggingRef = useRef(false);
  const rangeRef = useRef({ min, max });
  const [range, setRange] = useState({ min, max });

  useEffect(() => {
    if (!isDraggingRef.current) {
      const next = { min, max };
      rangeRef.current = next;
      setRange(next);
    }
  }, [min, max]);

  function applyRange(nextMin: number, nextMax: number) {
    const next = { min: nextMin, max: nextMax };
    rangeRef.current = next;
    setRange(next);
  }

  function moveMinHandle(v: number) {
    applyRange(Math.min(v, rangeRef.current.max), rangeRef.current.max);
  }

  function moveMaxHandle(v: number) {
    applyRange(rangeRef.current.min, Math.max(v, rangeRef.current.min));
  }

  function moveNearestHandle(v: number) {
    const { min: curMin, max: curMax } = rangeRef.current;
    const dMin = Math.abs(v - curMin);
    const dMax = Math.abs(v - curMax);
    if (dMin <= dMax) {
      const newMin = Math.min(v, curMax);
      applyRange(newMin, curMax);
      onChange(newMin, curMax);
    } else {
      const newMax = Math.max(v, curMin);
      applyRange(curMin, newMax);
      onChange(curMin, newMax);
    }
  }

  function valueFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return rangeRef.current.min;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.min(4, Math.max(1, Math.round(1 + ratio * 3)));
  }

  function startDrag(handle: 'min' | 'max', clientX: number) {
    cleanupDragRef.current?.();
    draggingRef.current = handle;
    isDraggingRef.current = true;
    const urlMin = min;
    const urlMax = max;
    const nextValue = valueFromClientX(clientX);
    if (handle === 'min') moveMinHandle(nextValue);
    else moveMaxHandle(nextValue);

    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const value = valueFromClientX(event.clientX);
      if (draggingRef.current === 'min') moveMinHandle(value);
      else moveMaxHandle(value);
    };

    let finished = false;
    const removeListeners = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      cleanupDragRef.current = null;
    };

    const onPointerUp = () => {
      if (finished) return;
      finished = true;
      stopDrag();
      isDraggingRef.current = false;
      const { min: endMin, max: endMax } = rangeRef.current;
      if (endMin !== urlMin || endMax !== urlMax) {
        onChange(endMin, endMax);
      }
      removeListeners();
    };

    const onPointerCancel = () => {
      if (finished) return;
      finished = true;
      stopDrag();
      isDraggingRef.current = false;
      const next = { min: urlMin, max: urlMax };
      rangeRef.current = next;
      setRange(next);
      removeListeners();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    cleanupDragRef.current = removeListeners;
  }

  function stopDrag() {
    draggingRef.current = null;
  }

  useEffect(() => {
    return () => cleanupDragRef.current?.();
  }, []);

  return (
    <div className="space-y-2">
      {/* Current range label */}
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold tabular-nums text-accent-text">
          {PRICE_LABELS[range.min]}
        </span>
        {range.min !== range.max && (
          <>
            <span className="mx-1 text-[11px] text-muted">—</span>
            <span className="text-[13px] font-bold tabular-nums text-accent-text">
              {PRICE_LABELS[range.max]}
            </span>
          </>
        )}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative flex h-7 items-center touch-none"
      >
        {/* Background rail */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border/50" />

        {/* Active fill between min and max */}
        <div
          className="absolute h-1.5 rounded-full bg-accent-border/80 transition-all"
          style={{ left: `${pct(range.min)}%`, right: `${100 - pct(range.max)}%` }}
        />

        {/* Draggable handles */}
        <button
          type="button"
          aria-label="Минимальная цена"
          className="absolute z-30 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-2 border-accent-border bg-surface shadow-md transition-transform hover:scale-110 active:scale-95"
          style={{ left: `${pct(range.min)}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag('min', e.clientX);
          }}
        />
        <button
          type="button"
          aria-label="Максимальная цена"
          className="absolute z-30 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-2 border-accent-border bg-surface shadow-md transition-transform hover:scale-110 active:scale-95"
          style={{ left: `${pct(range.max)}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag('max', e.clientX);
          }}
        />

        {/* Clickable hit areas + visual dots for each of the 4 positions */}
        {PRICE_POSITIONS.map((v) => {
          const isHandle = v === range.min || v === range.max;
          const isInRange = v > range.min && v < range.max;
          return (
            <button
              key={v}
              type="button"
              onClick={() => moveNearestHandle(v)}
              aria-label={PRICE_LABELS[v]}
              className={[
                'absolute z-20 -translate-x-1/2 rounded-full transition-all duration-150',
                isHandle
                  ? 'h-[18px] w-[18px] bg-transparent'
                  : isInRange
                  ? 'h-2 w-2 bg-accent-border/60 hover:scale-125'
                  : 'h-2 w-2 bg-border/60 hover:scale-125',
              ].join(' ')}
              style={{ left: `${pct(v)}%` }}
            />
          );
        })}
      </div>

      {/* Tick labels */}
      <div className="flex justify-between">
        {PRICE_POSITIONS.map((v) => (
          <span
            key={v}
            className={`text-[11px] font-semibold tabular-nums transition-colors ${
              v >= range.min && v <= range.max ? 'text-accent-text' : 'text-muted'
            }`}
          >
            {PRICE_LABELS[v]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RestaurantFiltersBar({
  locale,
  children,
}: {
  locale: Locale;
  children?: ReactNode;
}) {
  const t = getMessages(locale).home.filters;
  const router = useRouter();
  const searchParams = useSearchParams();

  const qFromURL = searchParams.get('q') ?? '';
  // Локальное значение инпута: даёт мгновенный отклик клавиатуре,
  // а на URL/сервер уходит дебаунс-запись (см. handler онChange).
  const [searchValue, setSearchValue] = useState(qFromURL);
  // Если URL поменялся снаружи (reset, back/forward), переcинхронизируем поле
  // через render-time-pattern (вместо useEffect, чтобы не было каскадного рендера).
  const [prevQ, setPrevQ] = useState(qFromURL);
  if (prevQ !== qFromURL) {
    setPrevQ(qFromURL);
    setSearchValue(qFromURL);
  }
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const sort = (searchParams.get('sort') ?? 'rating') as SortOption;
  const priceMin = Math.max(1, Math.min(4, parseInt(searchParams.get('pmin') ?? '1') || 1));
  const priceMax = Math.max(1, Math.min(4, parseInt(searchParams.get('pmax') ?? '4') || 4));
  const activeFeatures = parseList(searchParams.get('feat'));
  const openNow = searchParams.get('open') === '1';
  const pageFromURL = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  function setSort(value: SortOption) {
    router.replace(
      buildURL(searchParams, { sort: value === 'rating' ? null : value }),
      { scroll: false },
    );
  }

  function updatePriceRange(newMin: number, newMax: number) {
    router.replace(
      buildURL(searchParams, {
        pmin: newMin === 1 ? null : String(newMin),
        pmax: newMax === 4 ? null : String(newMax),
      }),
      { scroll: false },
    );
  }

  function toggleFeature(feature: string) {
    const next = activeFeatures.includes(feature)
      ? activeFeatures.filter((f) => f !== feature)
      : [...activeFeatures, feature];
    router.replace(
      buildURL(searchParams, { feat: next.length ? next.join(',') : null }),
      { scroll: false },
    );
  }

  function toggleOpenNow() {
    router.replace(
      buildURL(searchParams, { open: openNow ? null : '1' }),
      { scroll: false },
    );
  }

  function reset() {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchValue('');
    router.replace('/', { scroll: false });
  }

  const hasActiveFilters =
    searchValue !== '' ||
    qFromURL !== '' ||
    sort !== 'rating' ||
    priceMin > 1 ||
    priceMax < 4 ||
    activeFeatures.length > 0 ||
    openNow ||
    pageFromURL > 1;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'rating', label: t.sort.rating },
    { value: 'name', label: t.sort.name },
    { value: 'price_asc', label: t.sort.price_asc },
    { value: 'price_desc', label: t.sort.price_desc },
  ];

  return (
    <div className="space-y-4">

      {/* ── Top bar: search + sort + reset ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <path
              d="M11 5a6 6 0 014.77 9.64l3.3 3.3a1 1 0 11-1.42 1.42l-3.3-3.3A6 6 0 1111 5z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => {
              const v = e.target.value;
              setSearchValue(v);
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              searchDebounceRef.current = setTimeout(() => {
                router.replace(buildURL(searchParams, { q: v }), { scroll: false });
              }, SEARCH_DEBOUNCE_MS);
            }}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border/60 bg-surface pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                setSearchValue('');
                router.replace(buildURL(searchParams, { q: null }), { scroll: false });
              }}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <path d="M4 7h10M4 12h16M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label={t.sortLabel}
            className="h-10 cursor-pointer appearance-none rounded-xl border border-border/60 bg-surface py-0 pl-7 pr-8 text-sm font-medium text-foreground/85 outline-none transition hover:border-border hover:bg-surface-soft focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={reset}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border/50 px-3 text-sm font-medium text-muted transition-colors hover:border-border hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">{t.reset}</span>
          </button>
        )}
      </div>

      {/* ── Layout: sidebar (lg+) + content column ─────────────────────── */}
      <div className="flex items-start gap-5">

        {/* ── Sidebar — desktop only ───────────────────────────────────── */}
        <aside className="hidden w-48 shrink-0 space-y-5 rounded-2xl border border-border/30 bg-surface-soft/50 p-4 lg:block lg:sticky lg:top-20">

          {/* Open now */}
          <button
            type="button"
            onClick={toggleOpenNow}
            aria-pressed={openNow}
            className={[
              'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
              openNow
                ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'border-border/45 bg-surface/80 text-foreground/80 hover:border-accent-border/70 hover:bg-accent-bg hover:text-accent-text',
            ].join(' ')}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${openNow ? 'bg-emerald-500' : 'bg-muted'}`}
              aria-hidden="true"
            />
            {t.openNow}
          </button>

          {/* Price range */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t.priceLabel}
            </p>
            <PriceRangeSlider
              min={priceMin}
              max={priceMax}
              onChange={updatePriceRange}
            />
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t.featuresLabel}
            </p>
            <div className="flex flex-col gap-0.5">
              {FILTERABLE_FEATURES.map((feature) => {
                const label = t.features[feature] ?? feature;
                const icon = FEATURE_ICONS[feature];
                const active = activeFeatures.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    aria-pressed={active}
                    className={[
                      'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-left text-[13px] font-medium transition-colors',
                      active
                        ? 'border-accent-border/80 bg-accent-bg text-accent-text'
                        : 'border-transparent text-foreground/75 hover:border-accent-border/50 hover:bg-accent-bg/60 hover:text-accent-text',
                    ].join(' ')}
                  >
                    {icon && <span aria-hidden="true">{icon}</span>}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* ── Content column ───────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* Mobile filter strip — hidden on lg+ */}
          <div className="space-y-2 lg:hidden">
            {/* Open now + feature chips row */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleOpenNow}
                aria-pressed={openNow}
                className={[
                  'flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-colors',
                  openNow
                    ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-border/45 bg-surface/80 text-foreground/80 hover:border-accent-border/70 hover:bg-accent-bg hover:text-accent-text',
                ].join(' ')}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${openNow ? 'bg-emerald-500' : 'bg-muted'}`}
                  aria-hidden="true"
                />
                {t.openNow}
              </button>
              {FILTERABLE_FEATURES.map((feature) => {
                const label = t.features[feature] ?? feature;
                const icon = FEATURE_ICONS[feature];
                const active = activeFeatures.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    aria-pressed={active}
                    className={[
                      'flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
                      active
                        ? 'border-accent-border/80 bg-accent-bg text-accent-text'
                        : 'border-border/45 bg-surface/90 text-foreground/85 hover:border-accent-border/70 hover:bg-accent-bg hover:text-accent-text',
                    ].join(' ')}
                  >
                    {icon && <span aria-hidden="true">{icon}</span>}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Price range slider row */}
            <div className="rounded-xl border border-border/30 bg-surface-soft/50 px-4 pb-3 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                {t.priceLabel}
              </p>
              <PriceRangeSlider
                min={priceMin}
                max={priceMax}
                onChange={updatePriceRange}
              />
            </div>
          </div>

          {/* Restaurant list */}
          {children}
        </div>

      </div>
    </div>
  );
}
