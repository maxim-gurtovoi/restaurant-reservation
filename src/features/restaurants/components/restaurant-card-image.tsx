'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Минимальный клиентский слой только для fallback-картинки в карточке ресторана.
 * Остальная карточка — RSC (см. `restaurant-card.tsx`), чтобы не отправлять JS на 12 карточек.
 */
export function RestaurantCardImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <RestaurantCardImageFallback />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="object-cover transition duration-300 group-hover/card:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

export function RestaurantCardImageFallback() {
  return (
    <div className="h-full w-full bg-[linear-gradient(150deg,#ede9fe_0%,#f3eaff_55%,#e8d5f5_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(123,47,155,0.09)_1px,transparent_0)] bg-size-[20px_20px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl opacity-25">{'\uD83C\uDF7D\uFE0F'}</span>
      </div>
    </div>
  );
}
