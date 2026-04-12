'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';

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

export function RestaurantCard({ restaurant }: { restaurant: RestaurantListItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(restaurant.imageUrl) && !imgFailed;
  const street = useMemo(
    () => addressLine(restaurant.address, restaurant.city),
    [restaurant.address, restaurant.city],
  );
  const description =
    restaurant.description ?? 'Explore tables, floor plans, and reserve your preferred time.';

  return (
    <Link href={`/restaurants/${restaurant.slug}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-card-strong transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_8px_32px_rgba(28,28,28,0.18),0_24px_56px_rgba(28,28,28,0.12)]">

        {/* ── Hero image ────────────────────────────────────────────── */}
        <div className="relative h-56 shrink-0 overflow-hidden">
          {showImage ? (
            <img
              src={restaurant.imageUrl ?? ''}
              alt={`${restaurant.name} cover`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(150deg,#ede9fe_0%,#f3eaff_55%,#e8d5f5_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(123,47,155,0.09)_1px,transparent_0)] bg-size-[20px_20px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl opacity-25">🍽️</span>
              </div>
            </div>
          )}

          {/* Gradient — title/desc overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-[17px] font-bold leading-snug text-white drop-shadow-sm">
              {restaurant.name}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">
              {description}
            </p>
          </div>
        </div>

        {/* ── Card body ──────────────────────────────────────────────── */}
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

          <div className="rounded-xl border border-border/65 bg-surface-soft px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            View details
          </div>
        </div>
      </div>
    </Link>
  );
}
