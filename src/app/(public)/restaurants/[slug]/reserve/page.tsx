import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RestaurantReserveFlow } from '@/features/reservations/components/restaurant-reserve-flow';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';

type RestaurantReservePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RestaurantReservePage({ params }: RestaurantReservePageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-3">
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="inline-flex text-sm font-medium text-muted transition hover:text-foreground">
          ← Назад к заведению
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {restaurant.name}
          </h1>
          <p className="mt-1 text-sm text-muted">Бронирование столика</p>
        </div>
      </header>

      <RestaurantReserveFlow restaurant={restaurant} />
    </div>
  );
}
