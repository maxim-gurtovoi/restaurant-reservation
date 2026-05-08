import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RestaurantReserveFlow } from '@/features/reservations/components/restaurant-reserve-flow';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';
import { getCurrentUser } from '@/server/auth';
import { prisma } from '@/lib/prisma';

type RestaurantReservePageProps = {
  params: Promise<{ slug: string }>;
};

const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  'la-placinte-stefan-cel-mare': 'la-placinte',
};

export default async function RestaurantReservePage({ params }: RestaurantReservePageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant && LEGACY_SLUG_REDIRECTS[slug]) {
    const canonicalSlug = LEGACY_SLUG_REDIRECTS[slug];
    const canonicalRestaurant = await getRestaurantBySlug(canonicalSlug);
    if (canonicalRestaurant) {
      redirect(`/restaurants/${canonicalSlug}/reserve`);
    }
  }

  if (!restaurant) {
    notFound();
  }

  const bookingTimeZone = getRestaurantIanaZone(restaurant);

  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);

  let accountProfile: { name: string; phone: string | null } | null = null;
  if (user) {
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, phone: true },
    });
    if (row) {
      accountProfile = { name: row.name, phone: row.phone };
    }
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

      <RestaurantReserveFlow
        restaurant={restaurant}
        bookingTimeZone={bookingTimeZone}
        isLoggedIn={isLoggedIn}
        accountProfile={accountProfile}
      />
    </div>
  );
}
