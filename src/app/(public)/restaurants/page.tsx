import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';
import { getServerLocale } from '@/lib/i18n';

const CATEGORIES_RU = [
  { label: '🌇 Панорама / крыша' },
  { label: '🍔 Непринуждённо' },
  { label: '🍷 Изысканно' },
  { label: '👨‍👩‍👧 С детьми' },
  { label: '🌿 Терраса / сад' },
  { label: '🎶 Живая музыка' },
];
const CATEGORIES_RO = [
  { label: '🌇 Panoramă / rooftop' },
  { label: '🍔 Relaxat' },
  { label: '🍷 Rafinat' },
  { label: '👨‍👩‍👧 Cu copii' },
  { label: '🌿 Terasă / grădină' },
  { label: '🎶 Muzică live' },
];

export default async function RestaurantsPage() {
  const locale = await getServerLocale();
  const result = await listRestaurants({});
  const copy = locale === 'ro'
    ? {
        title: 'Restaurante',
        subtitle: 'Alege localul pentru a vedea mesele și planul sălii.',
        byType: 'După tip',
        categories: CATEGORIES_RO,
      }
    : {
        title: 'Рестораны',
        subtitle: 'Выберите заведение, чтобы увидеть столики и план зала.',
        byType: 'По типу',
        categories: CATEGORIES_RU,
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
      />
      <section className="space-y-3 rounded-2xl border border-border/30 bg-surface-soft/45 p-3.5 sm:space-y-3.5 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{copy.byType}</p>
        <div className="flex flex-wrap gap-2">
          {copy.categories.map(({ label }) => (
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
