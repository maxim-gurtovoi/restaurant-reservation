import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, StarIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { Button } from '@/components/ui/button';

type RestaurantHeroProps = {
  name: string;
  city: string;
  cuisine: string | null;
  priceLevel: number | null;
  rating: number | null;
  reviewsCount: number;
  coverImageUrl: string | null;
  reserveHref: string;
  phone: string | null;
  locale: Locale;
  openBadge: { tone: 'open' | 'closed' | 'unknown'; label: string };
  /** Favorite control (e.g. heart); positioned top-right on the cover. */
  favorite?: ReactNode;
};

function renderPriceTier(priceLevel: number | null): string {
  if (!priceLevel || priceLevel < 1) return '—';
  const clamped = Math.min(4, Math.max(1, priceLevel));
  return '\u20B4'.repeat(clamped);
}

const STATUS_TONES: Record<'open' | 'closed' | 'unknown', string> = {
  open: 'border-emerald-400/45 bg-emerald-500/15 text-emerald-100',
  closed: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  unknown: 'border-white/30 bg-white/10 text-white/80',
};

export function RestaurantHero({
  name,
  city,
  cuisine,
  priceLevel,
  rating,
  reviewsCount,
  coverImageUrl,
  reserveHref,
  phone,
  locale,
  openBadge,
  favorite,
}: RestaurantHeroProps) {
  const t = getMessages(locale).restaurantDetail;
  const ratingText = rating !== null ? rating.toFixed(1) : t.hero.ratingNotYet;
  const priceTier = renderPriceTier(priceLevel);

  return (
    <section
      aria-label={name}
      className="relative overflow-hidden rounded-3xl border border-border/40 bg-[#111318] shadow-card-strong"
    >
      <div className="relative h-[320px] w-full sm:h-[400px] lg:h-[460px]">
        {favorite ? (
          <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-10 lg:top-10">
            {favorite}
          </div>
        ) : null}
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={t.hero.coverAlt(name)}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#1f1629_0%,#3a1f4f_100%)]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-end gap-5 p-5 text-white sm:p-8 lg:p-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-bold text-white">
                <StarIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {ratingText}
              </span>
              <span className="text-white/80">·</span>
              <span className="text-white/85">{t.hero.reviews(reviewsCount)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[openBadge.tone]}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  openBadge.tone === 'open'
                    ? 'bg-emerald-300'
                    : openBadge.tone === 'closed'
                      ? 'bg-rose-300'
                      : 'bg-white/70'
                }`}
              />
              {openBadge.label}
            </span>
            {cuisine ? (
              <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur">
                {cuisine}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/85 backdrop-blur">
              <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {city}
            </span>
            {priceLevel ? (
              <span
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur"
                title={t.price.hint(priceLevel)}
              >
                {priceTier}
                <span className="ml-1 text-[10px] font-normal text-white/70">{t.price.hint(priceLevel)}</span>
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg" className="shadow-lg">
              <Link href={reserveHref}>{t.hero.reserveCta}</Link>
            </Button>
            {phone ? (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                {t.hero.callCta} · {phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
