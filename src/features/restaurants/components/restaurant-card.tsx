import Link from 'next/link';
import { MapPinIcon, StarIcon } from 'lucide-react';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { getRestaurantCardTranslation } from '@/features/restaurants/data/restaurant-card-translations';
import { getMessages } from '@/lib/messages';
import {
  RestaurantCardImage,
  RestaurantCardImageFallback,
} from '@/features/restaurants/components/restaurant-card-image';
import { RestaurantFavoriteHeart } from '@/features/restaurants/components/restaurant-favorite-heart';
import { restaurantPriceGlyphs } from '@/features/restaurants/lib/price-glyphs';
import { stripLeadingCuisineEcho } from '@/features/restaurants/lib/strip-cuisine-echo';

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
  initialFavorite,
}: {
  restaurant: RestaurantListItem;
  locale?: Locale;
  initialFavorite?: boolean;
}) {
  const street = addressLine(restaurant.address, restaurant.city);
  const translation = getRestaurantCardTranslation(restaurant.slug, locale);
  const t = getMessages(locale);
  const fallbackDescription = t.restaurants.fallbackDescription;
  const displayName = translation?.name ?? restaurant.name;
  const rawDescription = translation?.description ?? restaurant.description ?? fallbackDescription;
  const description = stripLeadingCuisineEcho(rawDescription, restaurant.cuisine);
  const glyphs = restaurantPriceGlyphs(restaurant.priceLevel);
  const detailsLabel = t.restaurants.details;
  const reserveLabel = t.restaurants.reserve;
  const detailHref = `/restaurants/${restaurant.slug}`;
  const reserveHref = `/restaurants/${restaurant.slug}/reserve`;

  return (
    <div className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-border/70 hover:shadow-card-strong">
      <Link href={detailHref} className="relative block aspect-4/3 w-full shrink-0 overflow-hidden bg-surface-soft">
        <div className="absolute right-2 top-2 z-20">
          <RestaurantFavoriteHeart
            restaurantId={restaurant.id}
            initialFavorite={initialFavorite}
            labels={{
              add: t.restaurants.favoriteAdd,
              remove: t.restaurants.favoriteRemove,
            }}
          />
        </div>
        <div className="absolute inset-0">
          {restaurant.imageUrl ? (
            <RestaurantCardImage src={restaurant.imageUrl} alt={`${displayName} cover`} />
          ) : (
            <RestaurantCardImageFallback />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link href={detailHref} className="min-w-0 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent-border">
          <h2 className="truncate text-base font-semibold leading-snug text-foreground">{displayName}</h2>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {restaurant.rating !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-bold text-white">
              <StarIcon className="h-3 w-3 fill-current" aria-hidden="true" />
              {restaurant.rating.toFixed(1)}
            </span>
          ) : null}
          {glyphs ? (
            <span className="rounded-full border border-border/55 bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
              {glyphs}
            </span>
          ) : null}
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-muted">
            <MapPinIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{restaurant.city}</span>
          </span>
        </div>

        {restaurant.cuisine ? (
          <p className="truncate text-xs font-semibold leading-snug text-foreground">{restaurant.cuisine}</p>
        ) : null}

        {description ? (
          <p className="line-clamp-2 text-xs font-normal leading-relaxed text-muted">{description}</p>
        ) : null}

        {street ? (
          <p className="truncate text-[11px] text-muted" title={street}>
            {street}
          </p>
        ) : null}

        <div className="mt-auto grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
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
