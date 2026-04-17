import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantInfoSidebar } from '@/features/restaurants/components/restaurant-info-sidebar';
import {
  RestaurantMenuPreviewBlock,
  RestaurantPracticalInfoBlock,
  RestaurantReviewsPreviewBlock,
} from '@/features/restaurants/components/restaurant-supporting-sections';
import { getRestaurantDetailSupportingContent } from '@/features/restaurants/data/restaurant-detail-content';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';

type RestaurantDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RestaurantDetailsPage({ params }: RestaurantDetailsPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const galleryImages = restaurant.galleryImages;
  const supporting = getRestaurantDetailSupportingContent(restaurant.slug);
  const reserveHref = `/restaurants/${restaurant.slug}/reserve`;
  const hasFloorData = restaurant.floorPlans.length > 0 && restaurant.tables.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr),minmax(280px,0.85fr)]">
        <section className="min-w-0 space-y-6">
          <header className="space-y-4 rounded-2xl border border-border/50 bg-surface p-6 shadow-card-strong">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-xs font-medium text-accent-text">
                {'\u2605'} {supporting.ratingSummary}
              </span>
              <span>По отзывам гостей</span>
              <span className="text-muted/60">·</span>
              <span className="rounded-full border border-border/60 bg-surface-soft px-2.5 py-1 text-xs font-medium text-foreground/70">
                {restaurant.city}
              </span>
            </div>
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <Link href={reserveHref}>Забронировать столик</Link>
            </Button>
          </header>

          <RestaurantPhotoGallery restaurantName={restaurant.name} imageUrls={galleryImages} />

          <section className="max-w-3xl space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">О заведении</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {supporting.aboutDescription ??
                restaurant.description ??
                'Уютное место для встреч с близкими. Выберите столик и удобное время.'}
            </p>
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
          reserveHref={reserveHref}
        />
      </div>

      <div className="min-w-0 space-y-4 border-t border-border/60 pt-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">План зала</h2>
            <p className="text-sm text-muted">
              Схема расстановки столов. Чтобы выбрать дату и свободный столик, перейдите к брони.
            </p>
          </div>
          <Button asChild variant="primary" className="w-full shrink-0 sm:w-auto">
            <Link href={reserveHref}>Забронировать столик</Link>
          </Button>
        </header>

        {hasFloorData ? (
          <FloorPlanView
            floorPlans={restaurant.floorPlans}
            tables={restaurant.tables}
            readOnly
            headerEyebrow="Обзор · план зала"
            restaurantSlug={restaurant.slug}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
            План зала для этого заведения пока не настроен.
          </div>
        )}
      </div>
    </div>
  );
}
