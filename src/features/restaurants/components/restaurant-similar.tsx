import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, StarIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';

type RestaurantSimilarProps = {
  restaurants: RestaurantListItem[];
  locale: Locale;
};

function priceGlyphs(level: number | null): string | null {
  if (!level) return null;
  const clamped = Math.min(4, Math.max(1, level));
  return '\u20B4'.repeat(clamped);
}

export function RestaurantSimilar({ restaurants, locale }: RestaurantSimilarProps) {
  if (!restaurants.length) return null;
  const t = getMessages(locale).restaurantDetail.similar;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted">{t.description}</p>
        </div>
        <Link
          href="/restaurants"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t.seeAll}
        </Link>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((r) => {
          const glyphs = priceGlyphs(r.priceLevel);
          return (
            <li key={r.id}>
              <Link
                href={`/restaurants/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-accent-border/70 hover:shadow-card-strong"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-soft">
                  {r.imageUrl ? (
                    <Image
                      src={r.imageUrl}
                      alt={r.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#F8F8F8_0%,#F3EAFF_100%)]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  <h3 className="truncate text-sm font-semibold text-foreground">{r.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    {r.rating !== null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-bold text-white">
                        <StarIcon className="h-3 w-3 fill-current" aria-hidden="true" />
                        {r.rating.toFixed(1)}
                      </span>
                    ) : null}
                    {glyphs ? (
                      <span className="rounded-full border border-border/55 bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
                        {glyphs}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 truncate text-[11px] text-muted">
                      <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                      <span className="truncate">{r.city}</span>
                    </span>
                  </div>
                  {r.cuisine ? (
                    <p className="truncate text-xs text-muted">{r.cuisine}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
