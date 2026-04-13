import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantInfoSidebar } from '@/features/restaurants/components/restaurant-info-sidebar';
import {
  RestaurantMenuPreviewBlock,
  RestaurantPracticalInfoBlock,
  RestaurantReviewsPreviewBlock,
} from '@/features/restaurants/components/restaurant-supporting-sections';
import { getRestaurantDetailSupportingContent } from '@/features/restaurants/data/restaurant-detail-content';

type RestaurantDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RestaurantDetailsPage({
  params,
}: RestaurantDetailsPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const galleryImages = restaurant.galleryImages;
  const supporting = getRestaurantDetailSupportingContent(restaurant.slug);

  return (
    <div className="space-y-8">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr),minmax(280px,0.85fr)]">
        <section className="min-w-0 space-y-6">
          <header className="space-y-3 rounded-2xl border border-border/50 bg-surface p-6 shadow-card-strong">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-xs font-medium text-accent-text">
                ★ {supporting.ratingSummary}
              </span>
              <span>По отзывам гостей</span>
              <span className="text-muted/60">·</span>
              <span className="rounded-full border border-border/60 bg-surface-soft px-2.5 py-1 text-xs font-medium text-foreground/70">
                {restaurant.city}
              </span>
            </div>
          </header>

          <RestaurantPhotoGallery restaurantName={restaurant.name} imageUrls={galleryImages} />

          <section className="max-w-3xl space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">О заведении</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {restaurant.description ??
                'Уютное место для встреч с близкими. Выберите столик и удобное время.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                Бронирование
              </span>
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                План зала
              </span>
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                Вход по QR
              </span>
            </div>
          </section>

          <RestaurantPracticalInfoBlock content={supporting} />

          <RestaurantMenuPreviewBlock items={supporting.menuPreview} />

          <RestaurantReviewsPreviewBlock reviews={supporting.reviews} />
        </section>

        <RestaurantInfoSidebar
          address={restaurant.address}
          phone={restaurant.phone}
          email={restaurant.email}
          workingHours={restaurant.workingHours}
        />
      </div>

      <div className="min-w-0 space-y-4 border-t border-border/60 pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Забронировать столик</h2>
          <p className="text-sm text-muted">
            Выберите время, число гостей и столик на плане зала.
          </p>
        </header>
        <section aria-label="Оформление брони" className="min-w-0 space-y-4">
          <ReservationSection
            restaurantId={restaurant.id}
            floorPlans={restaurant.floorPlans}
            tables={restaurant.tables}
          />
        </section>
      </div>
    </div>
  );
}
