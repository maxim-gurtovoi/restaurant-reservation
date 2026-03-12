import { PageHeader } from '@/components/ui/page-header';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';
import type { ApiSuccess } from '@/types/common';

export default async function RestaurantsPage() {
  const result = (await listRestaurants({})) as ApiSuccess<any>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        subtitle="Select a restaurant to see available tables and floor plans."
      />
      <RestaurantList restaurants={result.body} />
    </div>
  );
}
