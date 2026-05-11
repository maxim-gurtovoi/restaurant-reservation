import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RegisterModalTrigger } from '@/components/auth/register-modal-trigger';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { RestaurantListPagination } from '@/features/restaurants/components/restaurant-list-pagination';
import { RestaurantFiltersBar } from '@/features/restaurants/components/restaurant-filters-bar';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';
import { getFavoriteRestaurantIdSet } from '@/features/favorites/server/favorites.service';
import { RESTAURANTS_LIST_PAGE_SIZE, type SortOption } from '@/features/restaurants/constants';
import type { RestaurantFeature } from '@prisma/client';
import { getCurrentUser } from '@/server/auth';
import { getServerLocale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

const HOW_IT_WORKS_RU = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M3 12h18M3 6h18M3 18h18"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
    step: '01',
    title: 'Выберите ресторан',
    desc: 'Просматривайте список заведений, фото, описания и доступные столики.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 14h2m0 0h5m-5 0v2m0 3v2m5-7v2m0 3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    step: '02',
    title: 'Выберите столик',
    desc: 'Откройте план зала, нажмите на свободный стол и укажите дату и время.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
    step: '03',
    title: 'Подтвердите по QR',
    desc: 'Получите мгновенное подтверждение и личный QR-код, чтобы менеджер быстро отметил посещение.',
  },
];

const HOW_IT_WORKS_RO = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M3 12h18M3 6h18M3 18h18"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
    step: '01',
    title: 'Alege restaurantul',
    desc: 'Explorează localuri, fotografii, descrieri și mesele disponibile.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 14h2m0 0h5m-5 0v2m0 3v2m5-7v2m0 3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    step: '02',
    title: 'Alege masa',
    desc: 'Deschide planul sălii, selectează masa liberă și ora dorită.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
    step: '03',
    title: 'Confirmă cu QR',
    desc: 'Primești confirmarea instant și codul QR pentru check-in rapid.',
  },
];

const PLATFORM_HIGHLIGHTS_RU = [
  {
    title: 'Наглядный план зала',
    desc: 'Гости выбирают конкретные столики на интерактивной схеме зала.',
  },
  {
    title: 'Вход по QR',
    desc: 'У каждой брони есть QR-код для быстрого подтверждения на месте.',
  },
  {
    title: 'Актуальная занятость',
    desc: 'Предлагаются только свободные активные столики на выбранное время.',
  },
  {
    title: 'Несколько ресторанов',
    desc: 'Один аккаунт — бронирование в разных заведениях платформы.',
  },
];

const PLATFORM_HIGHLIGHTS_RO = [
  {
    title: 'Plan interactiv al sălii',
    desc: 'Clienții aleg masa exactă direct din schema restaurantului.',
  },
  {
    title: 'Intrare cu QR',
    desc: 'Fiecare rezervare are cod QR pentru confirmare rapidă la sosire.',
  },
  {
    title: 'Disponibilitate actuală',
    desc: 'Sunt afișate doar mesele active și libere pentru intervalul selectat.',
  },
  {
    title: 'Mai multe restaurante',
    desc: 'Un singur cont pentru rezervări în restaurante diferite de pe platformă.',
  },
];

const VALID_SORT_OPTIONS = new Set(['rating', 'name', 'price_asc', 'price_desc']);

function getString(v: string | string[] | undefined): string {
  return typeof v === 'string' ? v : '';
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Параллелим всё, что можно: cookies (locale, auth) и searchParams.
  const [locale, user, params] = await Promise.all([
    getServerLocale(),
    getCurrentUser(),
    searchParams,
  ]);
  const t = getMessages(locale);

  const q = getString(params.q);
  const rawSort = getString(params.sort);
  const sort: SortOption = VALID_SORT_OPTIONS.has(rawSort) ? (rawSort as SortOption) : 'rating';
  let priceMin = Math.max(1, Math.min(4, parseInt(getString(params.pmin)) || 1));
  let priceMax = Math.max(1, Math.min(4, parseInt(getString(params.pmax)) || 4));
  if (priceMin > priceMax) {
    const swap = priceMin;
    priceMin = priceMax;
    priceMax = swap;
  }
  const features = getString(params.feat)
    .split(',')
    .filter(Boolean) as RestaurantFeature[];
  const openNow = params.open === '1';
  const pageRaw = parseInt(getString(params.page), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const [result, favoriteIds] = await Promise.all([
    listRestaurants({
      q,
      sort,
      priceMin,
      priceMax,
      features,
      openNow,
      page,
      pageSize: RESTAURANTS_LIST_PAGE_SIZE,
    }),
    user
      ? getFavoriteRestaurantIdSet(user.id)
      : Promise.resolve(new Set<string>()),
  ]);
  const list = 'error' in result.body ? null : result.body;
  const restaurants = list?.items ?? [];
  const listingBase = {
    q,
    sort,
    priceMin,
    priceMax,
    features,
    openNow,
  };

  const howItWorks = locale === 'ro' ? HOW_IT_WORKS_RO : HOW_IT_WORKS_RU;
  const highlights = locale === 'ro' ? PLATFORM_HIGHLIGHTS_RO : PLATFORM_HIGHLIGHTS_RU;

  return (
    <div className="flex flex-col gap-12 pb-16 pt-1 sm:gap-16 sm:pb-20 md:gap-20">

      {/* ── Compact intro ─────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden rounded-2xl bg-surface/58 px-6 py-5 shadow-elev-2 backdrop-blur-xl sm:px-8 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-58"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 12% 18%, var(--hero-glow) 0%, transparent 54%), radial-gradient(circle at 88% 82%, color-mix(in srgb, var(--hero-to) 24%, transparent) 0%, transparent 62%), linear-gradient(130deg, color-mix(in srgb, var(--hero-from) 28%, transparent), color-mix(in srgb, var(--hero-via) 24%, transparent), color-mix(in srgb, var(--hero-to) 20%, transparent))',
            filter: 'blur(54px)',
            transform: 'scale(1.12)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-white/24" aria-hidden="true" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-1">
            <p className="inline-flex rounded-full border border-border/60 bg-surface/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {t.home.badge}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t.home.heroTitle}
            </h1>
            <p className="text-sm leading-relaxed text-foreground/75">
              {t.home.heroDescription}
            </p>
          </div>
          {!user && (
            <div className="shrink-0">
              <RegisterModalTrigger
                locale={locale}
                label={t.home.registerCta}
                className="border-white bg-white/20 font-semibold text-white hover:border-white hover:bg-white hover:text-foreground"
              />
            </div>
          )}
          {user && (
            <Button asChild variant="primary" className="shrink-0 shadow-none hover:shadow-none">
              <Link href="/my-reservations">{t.appShell.myReservations}</Link>
            </Button>
          )}
        </div>
      </section>

      {/* ── Restaurants ───────────────────────────────────────────── */}
      <section>
        <Suspense fallback={<div className="h-10 rounded-xl border border-border/60 bg-surface" />}>
          <RestaurantFiltersBar locale={locale}>
            {'error' in result.body ? (
              <p className="text-sm text-error">{result.body.error}</p>
            ) : list && list.total === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-base font-semibold text-foreground">{t.home.filters.noResults}</p>
                <p className="text-sm text-muted">{t.home.filters.noResultsHint}</p>
              </div>
            ) : list ? (
              <>
                <RestaurantList
                  restaurants={restaurants}
                  locale={locale}
                  favoriteIds={favoriteIds}
                />
                <RestaurantListPagination
                  locale={locale}
                  base={listingBase}
                  page={list.page}
                  totalPages={list.totalPages}
                  total={list.total}
                  pageSize={list.pageSize}
                />
              </>
            ) : null}
          </RestaurantFiltersBar>
        </Suspense>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 space-y-4 sm:space-y-5">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">{t.home.processLabel}</p>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{t.home.processTitle}</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {howItWorks.map(({ icon, step, title, desc }) => (
            <div
              key={step}
              className="relative space-y-3 rounded-2xl border border-border/30 bg-surface-soft/70 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border/50 bg-accent-bg/80 text-accent-text sm:h-11 sm:w-11">
                  {icon}
                </div>
                <span className="text-2xl font-black tabular-nums text-foreground/[0.07] sm:text-3xl">
                  {step}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key advantages ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">{t.home.advantagesLabel}</p>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{t.home.advantagesTitle}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4 lg:gap-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border/30 bg-surface-soft/60 p-3.5 sm:p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
