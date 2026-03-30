import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantInfoSidebar } from '@/features/restaurants/components/restaurant-info-sidebar';

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

  const galleryImages = restaurant.imageUrl ? [restaurant.imageUrl] : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(300px,0.85fr)]">
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
                4.6
              </span>
              <span>Based on guest feedback</span>
              <span className="text-muted/70">•</span>
              <span>{restaurant.city}</span>
            </div>
          </header>

          <RestaurantPhotoGallery restaurantName={restaurant.name} imageUrls={galleryImages} />

          <section className="max-w-3xl space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">About</h2>
            <p className="text-sm leading-relaxed text-foreground">
              {restaurant.description ??
                'A welcoming place for dining with friends and family. Explore available tables and reserve your preferred time.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                Reservations
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                Floor plan
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                QR check-in
              </span>
            </div>
          </section>
        </section>

        <RestaurantInfoSidebar
          address={restaurant.address}
          phone={restaurant.phone}
          email={restaurant.email}
          workingHours={restaurant.workingHours}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Book a table</h2>
          <p className="text-sm text-muted">
            Choose time, party size, and table on the floor plan.
          </p>
        </header>
        <section aria-label="Reservation flow" className="space-y-4">
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

