import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantInfoSidebar } from '@/features/restaurants/components/restaurant-info-sidebar';

type RestaurantDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

type DetailContent = {
  cuisineTags: string[];
  priceBand: string;
  amenities: string[];
  reviews: { author: string; text: string; rating: number }[];
};

const DEFAULT_DETAIL_CONTENT: DetailContent = {
  cuisineTags: ['Local favorites', 'Casual dining'],
  priceBand: 'MDL 250-450 per guest',
  amenities: ['Reservations', 'Indoor seating', 'Family friendly'],
  reviews: [
    {
      author: 'Guest',
      rating: 5,
      text: 'Great service and a comfortable atmosphere.',
    },
  ],
};

const DETAIL_CONTENT_BY_SLUG: Record<string, DetailContent> = {
  gastrobar: {
    cuisineTags: ['Cocktail bar', 'Seasonal plates', 'Mediterranean'],
    priceBand: 'MDL 300-550 per guest',
    amenities: ['Live music nights', 'QR check-in', 'Indoor seating'],
    reviews: [
      { author: 'Natalia H.', rating: 5, text: 'Warm vibe, great cocktails, and quick service.' },
      { author: 'Mihai L.', rating: 4, text: 'Good menu balance and easy table reservation.' },
    ],
  },
  'pegas-terrace-restaurant': {
    cuisineTags: ['Terrace dining', 'European', 'Wine friendly'],
    priceBand: 'MDL 280-500 per guest',
    amenities: ['Outdoor seating', 'Romantic setting', 'City views'],
    reviews: [
      { author: 'Elena S.', rating: 5, text: 'Lovely terrace and very attentive staff.' },
      { author: 'Dan P.', rating: 4, text: 'Great location for evening dinners.' },
    ],
  },
};

export default async function RestaurantDetailsPage({
  params,
}: RestaurantDetailsPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const galleryImages = restaurant.galleryImages;
  const detailContent = DETAIL_CONTENT_BY_SLUG[restaurant.slug] ?? DEFAULT_DETAIL_CONTENT;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(300px,0.85fr)]">
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
                4.6
              </span>
              <span>Based on guest feedback</span>
              <span className="text-muted/70">•</span>
              <span>{restaurant.city}</span>
            </div>
          </header>

          <RestaurantPhotoGallery restaurantName={restaurant.name} imageUrls={galleryImages} />

          <section className="max-w-3xl space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">About</h2>
            <p className="text-sm leading-relaxed text-foreground">
              {restaurant.description ??
                'A welcoming place for dining with friends and family. Explore available tables and reserve your preferred time.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                Reservations
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                Floor plan
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                QR check-in
              </span>
            </div>
          </section>

          <section className="max-w-3xl space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Practical info</h2>
            <div className="flex flex-wrap gap-2">
              {detailContent.cuisineTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                {detailContent.priceBand}
              </span>
            </div>
            <div className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
              {detailContent.amenities.map((item) => (
                <p key={item} className="rounded-md bg-background px-3 py-2 text-sm text-foreground">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="max-w-3xl space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Guest reviews</h2>
              <span className="text-xs text-muted">Preview</span>
            </div>
            <div className="space-y-2">
              {detailContent.reviews.map((review, idx) => (
                <article key={`${review.author}-${idx}`} className="rounded-lg bg-background px-3 py-2.5">
                  <p className="text-xs text-muted">
                    {review.author} · {'★'.repeat(review.rating)}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{review.text}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <RestaurantInfoSidebar
          address={restaurant.address}
          phone={restaurant.phone}
          email={restaurant.email}
          workingHours={restaurant.workingHours}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Book a table</h2>
          <p className="text-sm text-muted">
            Choose time, party size, and table on the floor plan.
          </p>
        </header>
        <section aria-label="Reservation flow" className="space-y-4">
          <ReservationSection
            restaurantId={restaurant.id}
            floorPlans={restaurant.floorPlans}
            tables={restaurant.tables}
          />
        </section>
      </div>
    </div>
  );
}

