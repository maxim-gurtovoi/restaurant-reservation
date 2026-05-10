import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import type { RestaurantListingBase } from '@/features/restaurants/lib/build-restaurant-listing-href';
import { buildRestaurantListingHref } from '@/features/restaurants/lib/build-restaurant-listing-href';

type Entry = number | 'ellipsis';

function paginationEntries(current: number, totalPages: number): Entry[] {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: Entry[] = [];
  const edge = new Set([1, 2, totalPages, totalPages - 1, current, current - 1, current + 1]);
  const sorted = [...edge].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push('ellipsis');
    out.push(n);
    prev = n;
  }
  return out;
}

export function RestaurantListPagination({
  locale,
  base,
  page,
  totalPages,
  total,
  pageSize,
}: {
  locale: Locale;
  base: RestaurantListingBase;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  if (totalPages <= 1) return null;

  const t = getMessages(locale).home.filters.pagination;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const entries = paginationEntries(page, totalPages);

  return (
    <nav
      className="flex flex-col items-center gap-3 border-t border-border/40 pt-6"
      aria-label={t.ariaLabel}
    >
      <p className="text-[13px] text-muted">
        {t.showing(from, to, total)}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Link
          href={buildRestaurantListingHref(base, Math.max(1, page - 1))}
          scroll={false}
          aria-disabled={page <= 1}
          className={[
            'rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
            page <= 1
              ? 'pointer-events-none border-border/30 text-muted/50'
              : 'border-border/50 text-foreground/85 hover:border-accent-border/70 hover:bg-accent-bg/60 hover:text-accent-text',
          ].join(' ')}
        >
          {t.prev}
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-1">
          {entries.map((entry, i) =>
            entry === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1 text-muted" aria-hidden>
                …
              </span>
            ) : (
              <Link
                key={entry}
                href={buildRestaurantListingHref(base, entry)}
                scroll={false}
                className={[
                  'flex min-w-[2.25rem] items-center justify-center rounded-xl border px-2 py-1.5 text-sm font-semibold tabular-nums transition-colors',
                  entry === page
                    ? 'border-accent-border bg-accent-bg text-accent-text'
                    : 'border-border/45 text-foreground/80 hover:border-accent-border/70 hover:bg-accent-bg/50 hover:text-accent-text',
                ].join(' ')}
                aria-current={entry === page ? 'page' : undefined}
              >
                {entry}
              </Link>
            ),
          )}
        </div>

        <Link
          href={buildRestaurantListingHref(base, Math.min(totalPages, page + 1))}
          scroll={false}
          aria-disabled={page >= totalPages}
          className={[
            'rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
            page >= totalPages
              ? 'pointer-events-none border-border/30 text-muted/50'
              : 'border-border/50 text-foreground/85 hover:border-accent-border/70 hover:bg-accent-bg/60 hover:text-accent-text',
          ].join(' ')}
        >
          {t.next}
        </Link>
      </div>
    </nav>
  );
}
