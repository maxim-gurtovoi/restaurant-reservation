import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/features/restaurants/components/restaurant-card';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';

const HOW_IT_WORKS = [
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
    title: 'Choose a restaurant',
    desc: 'Browse our list of restaurants, view photos, menus, and available tables.',
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
    title: 'Pick your table',
    desc: 'See the real floor plan, tap a free table, and pick a date and time.',
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
    title: 'Confirm with QR code',
    desc: 'Get instant confirmation and a personal QR code for quick check-in at the door.',
  },
];

const CATEGORIES = [
  { label: '🌇 Rooftop' },
  { label: '🍔 Casual dining' },
  { label: '🍷 Fine dining' },
  { label: '👨‍👩‍👧 Family friendly' },
  { label: '🌿 Garden terrace' },
  { label: '🎶 Live music' },
];

const PLATFORM_HIGHLIGHTS = [
  {
    title: 'Visual floor plan',
    desc: 'Guests pick specific tables directly on interactive restaurant layouts.',
  },
  {
    title: 'QR check-in',
    desc: 'Every reservation includes a QR code for faster on-site confirmation.',
  },
  {
    title: 'Real-time availability',
    desc: 'Only available active tables are offered for the selected date and time.',
  },
  {
    title: 'Multi-restaurant platform',
    desc: 'One account can browse and book across multiple restaurant concepts.',
  },
];

export default async function HomePage() {
  const result = await listRestaurants({});
  const featured = 'error' in result.body ? [] : result.body.slice(0, 6);

  return (
    <div className="space-y-14 pb-14 sm:space-y-16">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="space-y-7 pt-5">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Book a table at<br className="hidden sm:block" /> your favorite restaurant
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Browse restaurants, pick a table on the interactive floor plan, and confirm your reservation instantly with a QR code.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/restaurants">Browse restaurants</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">Create free account</Link>
          </Button>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-border/45 bg-surface-soft/70 p-4 shadow-card-soft sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Browse by type</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ label }) => (
            <Link
              key={label}
              href="/restaurants"
              className="rounded-full border border-border/60 bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-card-soft transition-colors hover:border-accent-border/70 hover:bg-accent-bg hover:text-accent-text"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured restaurants ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="space-y-7">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Top picks</p>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Featured restaurants</h2>
              <p className="text-sm text-muted">Popular places guests book most often.</p>
            </div>
            <Link
              href="/restaurants"
              className="shrink-0 text-sm font-medium text-accent-text hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Simple process</p>
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon, step, title, desc }) => (
            <div
              key={step}
              className="relative space-y-3 rounded-2xl border border-border/45 bg-surface p-5 shadow-card-soft"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-border/60 bg-accent-bg text-accent-text">
                  {icon}
                </div>
                <span className="text-3xl font-black tabular-nums text-foreground/6">
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
      <section className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Platform strengths</p>
          <h2 className="text-2xl font-bold text-foreground">Why guests use TableFlow</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border/45 bg-surface p-4 shadow-card-soft"
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-accent-border/55 bg-booking p-8 shadow-card-strong sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Ready to book your table?</h2>
            <p className="text-sm text-muted">
              Join guests already using the platform. Free to sign up, instant confirmation.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/restaurants">Browse restaurants</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/register">Sign up free</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
