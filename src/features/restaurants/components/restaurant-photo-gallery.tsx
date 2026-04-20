import Image from 'next/image';

type RestaurantPhotoGalleryProps = {
  restaurantName: string;
  imageUrls: string[];
};

type GalleryTile = {
  kind: 'image' | 'placeholder';
  src?: string;
};

function buildTiles(imageUrls: string[]): GalleryTile[] {
  const unique = [...new Set(imageUrls.map((v) => v.trim()).filter(Boolean))].slice(0, 6);
  if (unique.length === 0) {
    return [{ kind: 'placeholder' }, { kind: 'placeholder' }];
  }
  return unique.map((src) => ({ kind: 'image', src }));
}

export function RestaurantPhotoGallery({ restaurantName, imageUrls }: RestaurantPhotoGalleryProps) {
  const tiles = buildTiles(imageUrls);

  return (
    <section aria-label="Фотографии ресторана" className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Фото</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile, index) => (
          <div
            key={`${tile.kind}-${tile.src ?? index}`}
            className={[
              'overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-card',
              index === 0 ? 'col-span-2 sm:col-span-2' : '',
            ].join(' ')}
          >
            <div className={`relative ${index === 0 ? 'aspect-video' : 'aspect-4/3'}`}>
              {tile.kind === 'image' && tile.src ? (
                <Image
                  src={tile.src}
                  alt={`${restaurantName} photo ${index + 1}`}
                  fill
                  sizes={
                    index === 0
                      ? '(min-width: 640px) 66vw, 100vw'
                      : '(min-width: 640px) 33vw, 50vw'
                  }
                  className="object-cover"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F8F8F8_0%,#F3EAFF_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(123,47,155,0.07)_1px,transparent_0)] bg-size-[16px_16px]" />
                  <span className="relative rounded-xl border border-accent-border/50 bg-surface/95 px-3 py-1.5 text-xs text-muted shadow-card-soft">
                    Заглушка фото
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

