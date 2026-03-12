import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';

type RestaurantDetailsPageProps = {
  params: { slug: string };
};

export default async function RestaurantDetailsPage({
  params,
}: RestaurantDetailsPageProps) {
  const restaurant = await getRestaurantBySlug(params.slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={restaurant.name}
        subtitle={restaurant.city}
      />
      {restaurant.description ? (
        <p className="max-w-2xl text-sm text-slate-300">{restaurant.description}</p>
      ) : null}
      <div className="text-xs text-slate-400 space-y-1">
        {restaurant.address ? <p>{restaurant.address}</p> : null}
        {restaurant.phone ? <p>Phone: {restaurant.phone}</p> : null}
        {restaurant.email ? <p>Email: {restaurant.email}</p> : null}
      </div>
      <ReservationSection
        restaurantId={restaurant.id}
        floorPlans={restaurant.floorPlans}
        tables={restaurant.tables}
      />
    </div>
  );
}

