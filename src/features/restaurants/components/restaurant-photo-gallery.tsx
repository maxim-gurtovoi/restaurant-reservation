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
    <section aria-label="Restaurant photos" className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Photos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile, index) => (
          <div
            key={`${tile.kind}-${tile.src ?? index}`}
            className={[
              'overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
              index === 0 ? 'col-span-2 sm:col-span-2' : '',
            ].join(' ')}
          >
            <div className={index === 0 ? 'aspect-video' : 'aspect-4/3'}>
              {tile.kind === 'image' ? (
                <img
                  src={tile.src}
                  alt={`${restaurantName} photo ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.24)_1px,transparent_0)] bg-size-[14px_14px]" />
                  <span className="relative rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-xs text-gray-600">
                    Photo placeholder
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

