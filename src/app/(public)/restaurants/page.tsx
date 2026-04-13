import { PageHeader } from '@/components/ui/page-header';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';

export default async function RestaurantsPage() {
  const result = await listRestaurants({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Рестораны"
        subtitle="Выберите заведение, чтобы увидеть столики и план зала."
      />
      {'error' in result.body ? (
        <p className="text-sm text-error">{result.body.error}</p>
      ) : (
        <RestaurantList restaurants={result.body} />
      )}
    </div>
  );
}
