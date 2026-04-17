import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RegisterModalTrigger } from '@/components/auth/register-modal-trigger';
import { RestaurantCard } from '@/features/restaurants/components/restaurant-card';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';
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
    desc: 'Получите мгновенное подтверждение и личный QR-код для быстрого заселения.',
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

export default async function HomePage() {
  const locale = await getServerLocale();
  const t = getMessages(locale);
  const result = await listRestaurants({});
  const featured = 'error' in result.body ? [] : result.body.slice(0, 6);
  const howItWorks = locale === 'ro' ? HOW_IT_WORKS_RO : HOW_IT_WORKS_RU;
  const highlights = locale === 'ro' ? PLATFORM_HIGHLIGHTS_RO : PLATFORM_HIGHLIGHTS_RU;

  return (
    <div className="flex flex-col gap-12 pb-16 pt-1 sm:gap-16 sm:pb-20 md:gap-20">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/45 bg-surface/58 p-7 shadow-elev-2 backdrop-blur-xl sm:p-10 lg:p-14">
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

        <div className="relative max-w-4xl space-y-6 sm:space-y-7">
          <div className="space-y-4 sm:space-y-5">
            <p className="inline-flex rounded-full border border-border/60 bg-surface/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {t.home.badge}
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
              {t.home.heroTitle}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/75 sm:text-base">
              {t.home.heroDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link href="/restaurants">{t.home.restaurantsCta}</Link>
            </Button>
            <RegisterModalTrigger
              locale={locale}
              label={t.home.registerCta}
              className="border-white bg-white/20 font-semibold text-white hover:border-white hover:bg-white hover:text-foreground"
            />
          </div>
        </div>
      </section>

      {/* ── Featured restaurants (primary content anchor) ─────────── */}
      {featured.length > 0 && (
        <section className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl border border-border-strong/35 bg-surface-soft/60 p-5 shadow-card-soft sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">{t.home.featuredLabel}</p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-[1.875rem]">
                  {t.home.featuredTitle}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted">
                  {t.home.featuredDescription}
                </p>
              </div>
              <Link
                href="/restaurants"
                className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg px-1 py-1 text-sm font-semibold text-accent-text underline-offset-4 transition-colors hover:underline sm:self-auto"
              >
                {t.home.allRestaurants}
                <span aria-hidden="true" className="text-base leading-none">
                  →
                </span>
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {featured.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works (secondary — calmer surfaces) ────────────── */}
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

      {/* ── Key advantages (tertiary — compact) ───────────────────── */}
      <section className="space-y-4 sm:space-y-4">
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

      {/* ── Bottom CTA (closing block — stronger emphasis) ────────── */}
      <section className="overflow-hidden rounded-3xl border border-white/45 bg-surface/55 p-8 backdrop-blur-xl ring-1 ring-white/30 sm:p-10 md:p-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center sm:gap-10">
          <div className="max-w-xl space-y-2 sm:space-y-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t.home.bottomTitle}
            </h2>
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              {t.home.bottomDescription}
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild variant="primary" className="w-full shadow-none hover:shadow-none sm:w-auto">
              <Link href="/restaurants">{t.home.restaurantsCta}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/auth/register">{t.home.bottomRegister}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
