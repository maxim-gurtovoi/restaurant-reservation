import type { RestaurantDetailSupportingContent } from '@/features/restaurants/data/restaurant-detail-content';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

function StarRow({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-500" aria-hidden="true">
        {'\u2605'.repeat(clamped)}
      </span>
      <span className="sr-only">{clamped} / 5</span>
    </span>
  );
}

export function RestaurantMenuPreviewBlock({
  items,
  locale,
}: {
  items: RestaurantDetailSupportingContent['menuPreview'];
  locale: Locale;
}) {
  if (!items.length) return null;
  const t = getMessages(locale).restaurantDetail.menu;
  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t.title}</h2>
        <span className="text-[11px] text-muted">{t.note}</span>
      </div>
      <ul className="divide-y divide-border/40">
        {items.map((dish) => (
          <li
            key={dish.name}
            className="flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
          >
            <span className="text-foreground/90">{dish.name}</span>
            <span className="shrink-0 tabular-nums text-muted">{dish.price}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RestaurantReviewsPreviewBlock({
  reviews,
  locale,
}: {
  reviews: RestaurantDetailSupportingContent['reviews'];
  locale: Locale;
}) {
  const t = getMessages(locale).restaurantDetail.reviews;
  return (
    <section className="space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t.title}</h2>
      <ul className="space-y-3">
        {reviews.map((review, idx) => (
          <li key={`${review.author}-${idx}`}>
            <article className="rounded-xl border border-border/35 bg-surface-soft/40 px-4 py-3">
              <p className="flex flex-wrap items-center gap-x-2 text-xs">
                <span className="font-medium text-foreground">{review.author}</span>
                <StarRow rating={review.rating} />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/88">{review.text}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
