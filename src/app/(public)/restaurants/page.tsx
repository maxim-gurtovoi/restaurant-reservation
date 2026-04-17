import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';
import { getServerLocale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export default async function RestaurantsPage() {
  const locale = await getServerLocale();
  const t = getMessages(locale);
  const result = await listRestaurants({});

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.restaurants.title}
        subtitle={t.restaurants.subtitle}
      />
      <section className="space-y-3 rounded-2xl border border-border/30 bg-surface-soft/45 p-3.5 sm:space-y-3.5 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{t.restaurants.byType}</p>
        <div className="flex flex-wrap gap-2">
          {t.restaurants.categories.map((label) => (
            <Link
              key={label}
              href="/restaurants"
              className="rounded-full border border-border/45 bg-surface/90 px-3.5 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:border-accent-border/70 hover:bg-accent-bg hover:text-accent-text"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
      {'error' in result.body ? (
        <p className="text-sm text-error">{result.body.error}</p>
      ) : (
        <RestaurantList restaurants={result.body} locale={locale} />
      )}
    </div>
  );
}
