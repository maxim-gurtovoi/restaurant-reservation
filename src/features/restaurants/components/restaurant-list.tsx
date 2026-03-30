import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { RestaurantCard } from '@/features/restaurants/components/restaurant-card';

type RestaurantListProps = {
  restaurants: RestaurantListItem[];
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}

