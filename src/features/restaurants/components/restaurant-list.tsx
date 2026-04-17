import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { RestaurantCard } from '@/features/restaurants/components/restaurant-card';
import type { Locale } from '@/lib/i18n';

type RestaurantListProps = {
  restaurants: RestaurantListItem[];
  locale?: Locale;
};

export function RestaurantList({ restaurants, locale = 'ru' }: RestaurantListProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />
      ))}
    </div>
  );
}

