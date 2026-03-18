import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';

type RestaurantListProps = {
  restaurants: RestaurantListItem[];
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((r) => (
        <Link key={r.id} href={`/restaurants/${r.slug}`}>
          <Card className="h-full cursor-pointer transition hover:border-[#107c41] hover:shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">{r.name}</h2>
            <p className="text-xs text-gray-500">{r.city}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

