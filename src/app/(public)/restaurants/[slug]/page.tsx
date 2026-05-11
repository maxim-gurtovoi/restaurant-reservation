import { notFound, redirect } from 'next/navigation';
import { RestaurantHero } from '@/features/restaurants/components/restaurant-hero';
import { RestaurantFeatureTags } from '@/features/restaurants/components/restaurant-feature-tags';
import {
  RestaurantActionsCard,
  RestaurantAddressCard,
  RestaurantQuickFactsCard,
  RestaurantSocialLinksCard,
  RestaurantWorkingHoursCard,
} from '@/features/restaurants/components/restaurant-aside-cards';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantExternalRatings } from '@/features/restaurants/components/restaurant-external-ratings';
import { RestaurantSimilar } from '@/features/restaurants/components/restaurant-similar';
import { RestaurantFloorPlanSection } from '@/features/restaurants/components/restaurant-floor-plan-section';
import {
  RestaurantMenuPreviewBlock,
  RestaurantReviewsPreviewBlock,
} from '@/features/restaurants/components/restaurant-supporting-sections';
import { getRestaurantDetailSupportingContent } from '@/features/restaurants/data/restaurant-detail-content';
import {
  getRestaurantBySlug,
  listSimilarRestaurants,
} from '@/features/restaurants/server/restaurants.service';
import { RestaurantFavoriteHeart } from '@/features/restaurants/components/restaurant-favorite-heart';
import { getFavoriteRestaurantIdSet } from '@/features/favorites/server/favorites.service';
import { getCurrentUser } from '@/server/auth';
import {
  buildWeeklyRows,
  getOpenStatus,
  type OpenStatusLabels,
} from '@/features/restaurants/lib/open-status';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';
import { getServerLocale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

type RestaurantDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  'la-placinte-stefan-cel-mare': 'la-placinte',
};

export default async function RestaurantDetailsPage({ params }: RestaurantDetailsPageProps) {
  const { slug } = await params;
  // Параллелим cookies/locale, основной запрос ресторана и подбор похожих.
  // Похожие исключают `slug` (если ресторан не найдётся, мы просто отбросим результат).
  const [locale, restaurant, similarRestaurants] = await Promise.all([
    getServerLocale(),
    getRestaurantBySlug(slug),
    listSimilarRestaurants({ excludeSlug: slug, limit: 4 }),
  ]);

  if (!restaurant && LEGACY_SLUG_REDIRECTS[slug]) {
    const canonicalSlug = LEGACY_SLUG_REDIRECTS[slug];
    const canonicalRestaurant = await getRestaurantBySlug(canonicalSlug);
    if (canonicalRestaurant) {
      redirect(`/restaurants/${canonicalSlug}`);
    }
  }

  if (!restaurant) {
    notFound();
  }

  const messages = getMessages(locale);
  const t = messages.restaurantDetail;
  const supporting = getRestaurantDetailSupportingContent(restaurant.slug);
  const reserveHref = `/restaurants/${restaurant.slug}/reserve`;
  const zone = getRestaurantIanaZone({ timeZone: restaurant.timeZone ?? null });
  const hoursLabels: OpenStatusLabels = {
    open: t.hero.openNow,
    closed: t.hero.closedNow,
    unknown: t.hero.statusUnknown,
    dayOff: t.hours.dayOff,
    unavailable: t.hours.unavailable,
    allDay: t.hours.allDay,
    dayNames: t.hours.dayNames,
  };
  const openStatus = getOpenStatus(restaurant.workingHours, zone, hoursLabels);
  const weeklyRows = buildWeeklyRows(restaurant.workingHours, zone, hoursLabels);
  const seatsTotal = restaurant.tables
    .filter((table) => table.isActive)
    .reduce((sum, t2) => sum + t2.capacity, 0);

  const user = await getCurrentUser();
  const favoriteIds = user ? await getFavoriteRestaurantIdSet(user.id) : null;

  return (
    <div className="space-y-10">
      <RestaurantHero
        name={restaurant.name}
        city={restaurant.city}
        cuisine={restaurant.cuisine}
        priceLevel={restaurant.priceLevel}
        rating={restaurant.rating}
        reviewsCount={restaurant.reviewsCount}
        coverImageUrl={restaurant.coverImageUrl}
        reserveHref={reserveHref}
        phone={restaurant.phone}
        locale={locale}
        openBadge={{ tone: openStatus.tone, label: openStatus.label }}
        favorite={
          <RestaurantFavoriteHeart
            restaurantId={restaurant.id}
            initialFavorite={favoriteIds ? favoriteIds.has(restaurant.id) : undefined}
            labels={{
              add: messages.restaurants.favoriteAdd,
              remove: messages.restaurants.favoriteRemove,
            }}
          />
        }
      />

      <RestaurantFeatureTags features={restaurant.features} locale={locale} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="min-w-0 space-y-6">
          <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">{t.about.title}</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {supporting.aboutDescription ?? restaurant.description ?? t.about.fallback}
            </p>
          </section>

          <RestaurantPhotoGallery
            restaurantName={restaurant.name}
            imageUrls={restaurant.galleryImages}
          />

          <RestaurantMenuPreviewBlock items={supporting.menuPreview} locale={locale} />

          <RestaurantExternalRatings
            ratings={supporting.externalRatings}
            locale={locale}
          />

          <RestaurantReviewsPreviewBlock reviews={supporting.reviews} locale={locale} />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <RestaurantActionsCard
            reserveHref={reserveHref}
            phone={restaurant.phone}
            openStatus={openStatus}
            locale={locale}
          />
          <RestaurantQuickFactsCard
            cuisine={restaurant.cuisine}
            priceLevel={restaurant.priceLevel}
            rating={restaurant.rating}
            reviewsCount={restaurant.reviewsCount}
            seatsTotal={seatsTotal}
            floorsCount={restaurant.floorPlans.length}
            locale={locale}
          />
          <RestaurantAddressCard
            address={restaurant.address}
            googleMapsUrl={restaurant.googleMapsUrl}
            locale={locale}
          />
          <RestaurantWorkingHoursCard rows={weeklyRows} locale={locale} />
          <RestaurantSocialLinksCard
            websiteUrl={restaurant.websiteUrl}
            instagramUrl={restaurant.instagramUrl}
            facebookUrl={restaurant.facebookUrl}
            googleMapsUrl={restaurant.googleMapsUrl}
            phone={restaurant.phone}
            email={restaurant.email}
            locale={locale}
          />
        </aside>
      </div>

      <RestaurantFloorPlanSection
        floorPlans={restaurant.floorPlans}
        tables={restaurant.tables}
        floorPlanElements={restaurant.floorPlanElements}
        reserveHref={reserveHref}
        locale={locale}
      />

      <RestaurantSimilar restaurants={similarRestaurants} locale={locale} />
    </div>
  );
}
