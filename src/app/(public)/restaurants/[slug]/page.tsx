import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';

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

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {restaurant.name}
        </h1>
        <p className="text-sm text-muted">{restaurant.city}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr),minmax(0,0.8fr)]">
        <section aria-label="Reservation flow" className="space-y-4">
          <ReservationSection
            restaurantId={restaurant.id}
            floorPlans={restaurant.floorPlans}
            tables={restaurant.tables}
          />
        </section>

        <aside
          aria-label="About this restaurant"
          className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
          {restaurant.description ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                About
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{restaurant.description}</p>
            </div>
          ) : null}

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Details
            </h3>
            <div className="space-y-1 text-sm text-foreground">
              {restaurant.address ? <p>{restaurant.address}</p> : null}
              {restaurant.phone ? <p>Phone: {restaurant.phone}</p> : null}
              {restaurant.email ? <p>Email: {restaurant.email}</p> : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

