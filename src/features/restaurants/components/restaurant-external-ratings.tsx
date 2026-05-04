import { StarIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import type { ExternalRating } from '@/features/restaurants/data/restaurant-detail-content';

type RestaurantExternalRatingsProps = {
  ratings: ExternalRating[];
  locale: Locale;
};

function renderStars(rating: number) {
  const rounded = Math.round(rating * 2) / 2;
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.floor(rounded);
    const half = !filled && i + 0.5 === rounded;
    return (
      <StarIcon
        key={i}
        className={`h-3.5 w-3.5 ${filled || half ? 'fill-amber-400 text-amber-400' : 'text-border/60'}`}
        aria-hidden="true"
      />
    );
  });
}

export function RestaurantExternalRatings({ ratings, locale }: RestaurantExternalRatingsProps) {
  if (!ratings.length) return null;
  const t = getMessages(locale).restaurantDetail.externalRatings;

  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t.title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ratings.map((r) => (
          <li
            key={r.source}
            className="flex items-center gap-3 rounded-xl border border-border/45 bg-surface-soft/40 px-3 py-2.5"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-foreground/85">
                {t.sources[r.source] ?? r.source}
              </span>
              <span className="flex items-center gap-1">
                {renderStars(r.rating)}
                <span className="ml-1 text-xs font-medium tabular-nums text-foreground">
                  {r.rating.toFixed(1)}
                </span>
              </span>
            </div>
            <span className="text-xs font-medium tabular-nums text-muted">
              {r.reviewsCount.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
