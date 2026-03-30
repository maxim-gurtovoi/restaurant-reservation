'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';

type RestaurantCardProps = {
  restaurant: RestaurantListItem;
};

function descriptionPreview(value: string | null): string {
  return value ?? 'Explore tables, floor plans, and available reservation slots.';
}

function addressWithoutRepeatedCity(address: string | null, city: string): string | null {
  if (!address) return null;
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;

  const lastPart = parts[parts.length - 1]?.toLowerCase();
  if (lastPart === city.trim().toLowerCase()) {
    parts.pop();
  }

  return parts.length ? parts.join(', ') : null;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isImageFailed, setIsImageFailed] = useState(false);
  const addressLabel = useMemo(
    () => addressWithoutRepeatedCity(restaurant.address, restaurant.city),
    [restaurant.address, restaurant.city],
  );
  const showImage = Boolean(restaurant.imageUrl) && !isImageFailed;

  return (
    <Link href={`/restaurants/${restaurant.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-2xl border-gray-200/90 p-0 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:shadow-lg">
        <div className="relative h-40 w-full bg-gray-100">
          {showImage ? (
            <img
              src={restaurant.imageUrl ?? ''}
              alt={`${restaurant.name} cover`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setIsImageFailed(true)}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.24)_1px,transparent_0)] bg-size-[14px_14px]" />
              <div className="relative flex flex-col items-center gap-2 rounded-xl border border-gray-300/70 bg-white/70 px-4 py-3 backdrop-blur-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                >
                  <path
                    d="M5 19h14M8 5v9m4-9v9m4-9v9M7 5h2m4 0h2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-600">Photo coming soon</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2.5 p-4">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">{restaurant.name}</h2>
          <p className="text-xs text-gray-500/90">
            {restaurant.city}
            {addressLabel ? ` · ${addressLabel}` : ''}
          </p>
          <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-gray-600/90">
            {descriptionPreview(restaurant.description)}
          </p>

          <div className="border-t border-gray-200/80 pt-2.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition group-hover:gap-2">
              Open details
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
              >
                <path
                  d="M4 10h12m0 0-4-4m4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

