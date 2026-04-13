import type { RestaurantDetailSupportingContent } from '@/features/restaurants/data/restaurant-detail-content';

function StarRow({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-500" aria-hidden="true">
        {'★'.repeat(clamped)}
      </span>
      <span className="sr-only">
        {clamped} из 5 звёзд
      </span>
    </span>
  );
}

export function RestaurantPracticalInfoBlock({
  content,
}: {
  content: RestaurantDetailSupportingContent;
}) {
  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-border/40 bg-surface-soft/50 p-5 shadow-card-soft">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Кратко</h2>
      <div className="flex flex-wrap gap-2">
        {content.cuisineTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-accent-border/60 bg-accent-bg/80 px-2.5 py-1 text-[11px] font-medium text-accent-text"
          >
            {tag}
          </span>
        ))}
        <span className="rounded-full border border-border/55 bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground/75">
          {content.priceBand}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {content.amenities.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border/45 bg-surface px-2.5 py-1 text-[11px] text-foreground/80"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export function RestaurantMenuPreviewBlock({
  items,
}: {
  items: RestaurantDetailSupportingContent['menuPreview'];
}) {
  if (!items.length) return null;
  return (
    <section className="max-w-3xl space-y-3 rounded-2xl border border-border/40 bg-surface-soft/40 p-5 shadow-card-soft">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Фрагмент меню</h2>
        <span className="text-[11px] text-muted">Пример блюд — не онлайн-заказ</span>
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
}: {
  reviews: RestaurantDetailSupportingContent['reviews'];
}) {
  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-border/40 bg-surface-soft/35 p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Отзывы гостей</h2>
        <span className="rounded-full border border-border/45 bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Демо
        </span>
      </div>
      <ul className="space-y-3">
        {reviews.map((review, idx) => (
          <li key={`${review.author}-${idx}`}>
            <article className="rounded-xl border border-border/35 bg-surface px-4 py-3">
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
