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
          <Card className="h-full cursor-pointer transition hover:border-emerald-500 hover:bg-slate-900">
            <h2 className="text-lg font-semibold">{r.name}</h2>
            <p className="text-xs text-slate-400">{r.city}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

