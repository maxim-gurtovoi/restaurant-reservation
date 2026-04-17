'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { getRestaurantCardTranslation } from '@/features/restaurants/data/restaurant-card-translations';

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
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(restaurant.imageUrl) && !imgFailed;
  const street = useMemo(
    () => addressLine(restaurant.address, restaurant.city),
    [restaurant.address, restaurant.city],
  );
  const translation = getRestaurantCardTranslation(restaurant.slug, locale);
  const fallbackDescription =
    locale === 'ro'
      ? 'Planul sălii, mese libere și rezervare rapidă la ora dorită.'
      : 'План зала, свободные столики и бронирование на удобное время.';
  const displayName = translation?.name ?? restaurant.name;
  const description = translation?.description ?? restaurant.description ?? fallbackDescription;
  const detailsLabel = locale === 'ro' ? 'Detalii' : 'Подробнее';
  const reserveLabel = locale === 'ro' ? 'Rezervă' : 'Забронировать';
  const detailHref = `/restaurants/${restaurant.slug}`;
  const reserveHref = `/restaurants/${restaurant.slug}/reserve`;

  return (
    <div className="group/card flex h-full flex-col overflow-hidden rounded-3xl bg-surface transition-all duration-200 hover:-translate-y-1">
      <Link href={detailHref} className="block shrink-0">
        <div className="relative h-56 overflow-hidden">
          {showImage ? (
            <img
              src={restaurant.imageUrl ?? ''}
              alt={`${displayName} cover`}
              className="h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.06]"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(150deg,#ede9fe_0%,#f3eaff_55%,#e8d5f5_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(123,47,155,0.09)_1px,transparent_0)] bg-size-[20px_20px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl opacity-25">{'\uD83C\uDF7D\uFE0F'}</span>
              </div>
            </div>
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
          <Button asChild variant="outline" className="w-full text-sm font-medium">
            <Link href={detailHref}>{detailsLabel}</Link>
          </Button>
          <Button asChild variant="primary" className="w-full text-sm font-medium shadow-none hover:shadow-none">
            <Link href={reserveHref}>{reserveLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
