import { PageHeader } from '@/components/ui/page-header';
import { RestaurantList } from '@/features/restaurants/components/restaurant-list';
import { listFavoriteRestaurantsForUser } from '@/features/favorites/server/favorites.service';
import { getCurrentUser } from '@/server/auth';
import { getServerLocale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { notFound } from 'next/navigation';

export default async function MyFavoritesPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const locale = await getServerLocale();
  const t = getMessages(locale);
  const restaurants = await listFavoriteRestaurantsForUser(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.appShell.myFavorites}
        subtitle={
          locale === 'ro'
            ? 'Restaurantele salvate în contul tău.'
            : 'Заведения, которые вы сохранили в аккаунте.'
        }
      />
      {restaurants.length === 0 ? (
        <p className="text-sm text-muted">
          {locale === 'ro'
            ? 'Încă nu ai favorite — apasă pe inimă pe cardul restaurantului.'
            : 'Пока пусто — нажмите сердечко на карточке ресторана.'}
        </p>
      ) : (
        <RestaurantList restaurants={restaurants} locale={locale} favoriteIds={new Set(restaurants.map((r) => r.id))} />
      )}
    </div>
  );
}
