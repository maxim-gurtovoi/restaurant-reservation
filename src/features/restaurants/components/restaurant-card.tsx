import Link from 'next/link';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { getRestaurantCardTranslation } from '@/features/restaurants/data/restaurant-card-translations';
import { getMessages } from '@/lib/messages';
import {
  RestaurantCardImage,
  RestaurantCardImageFallback,
} from '@/features/restaurants/components/restaurant-card-image';

function addressLine(address: string | null, city: string): string | null {
  if (!address) return null;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const cityLower = city.trim().toLowerCase();
  if (parts[0]?.toLowerCase() === cityLower) parts.shift();
  else if (parts[parts.length - 1]?.toLowerCase() === cityLower) parts.pop();
  const normalized = parts
    .join(', ')
    .replace(/\bstrada\b/gi, 'Str.')
    .replace(/\bbulevardul\b/gi, 'Bd.');
  return normalized.length ? normalized : null;
}

export function RestaurantCard({
  restaurant,
  locale = 'ru',
}: {
  restaurant: RestaurantListItem;
  locale?: Locale;
}) {
  const street = addressLine(restaurant.address, restaurant.city);
  const translation = getRestaurantCardTranslation(restaurant.slug, locale);
  const t = getMessages(locale);
  const fallbackDescription = t.restaurants.fallbackDescription;
  const displayName = translation?.name ?? restaurant.name;
  const description = translation?.description ?? restaurant.description ?? fallbackDescription;
  const detailsLabel = t.restaurants.details;
  const reserveLabel = t.restaurants.reserve;
  const detailHref = `/restaurants/${restaurant.slug}`;
  const reserveHref = `/restaurants/${restaurant.slug}/reserve`;

  return (
    <div className="group/card flex h-full flex-col overflow-hidden rounded-3xl bg-surface transition-all duration-200 hover:-translate-y-1">
      <Link href={detailHref} className="block shrink-0">
        <div className="relative h-56 overflow-hidden">
          {restaurant.imageUrl ? (
            <RestaurantCardImage src={restaurant.imageUrl} alt={`${displayName} cover`} />
          ) : (
            <RestaurantCardImageFallback />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-[17px] font-bold leading-snug text-white">
              {displayName}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">
              {description}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3 bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
            {restaurant.city}
          </span>
          {street && (
            <span className="truncate text-[11px] text-muted" title={street}>
              {street}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button asChild variant="primary" className="w-full text-sm font-medium shadow-none hover:shadow-none">
            <Link href={reserveHref}>{reserveLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full text-sm font-medium">
            <Link href={detailHref}>{detailsLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
