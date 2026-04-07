import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/features/restaurants/server/restaurants.service';
import { ReservationSection } from '@/features/reservations/components/reservation-section';
import { RestaurantPhotoGallery } from '@/features/restaurants/components/restaurant-photo-gallery';
import { RestaurantInfoSidebar } from '@/features/restaurants/components/restaurant-info-sidebar';

type RestaurantDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

type DetailContent = {
  ratingSummary: string;
  cuisineTags: string[];
  priceBand: string;
  amenities: string[];
  reviews: { author: string; text: string; rating: number }[];
};

const DEFAULT_DETAIL_CONTENT: DetailContent = {
  ratingSummary: '4.6',
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
    ratingSummary: '4.8',
    cuisineTags: ['Cocktail bar', 'Seasonal plates', 'Mediterranean'],
    priceBand: 'MDL 300-550 per guest',
    amenities: ['Live music nights', 'QR check-in', 'Indoor seating'],
    reviews: [
      { author: 'Natalia H.', rating: 5, text: 'Warm vibe, great cocktails, and quick service.' },
      { author: 'Mihai L.', rating: 4, text: 'Good menu balance and easy table reservation.' },
    ],
  },
  'pegas-terrace-restaurant': {
    ratingSummary: '4.7',
    cuisineTags: ['Terrace dining', 'European', 'Wine friendly'],
    priceBand: 'MDL 280-500 per guest',
    amenities: ['Outdoor seating', 'Romantic setting', 'City views'],
    reviews: [
      { author: 'Elena S.', rating: 5, text: 'Lovely terrace and very attentive staff.' },
      { author: 'Dan P.', rating: 4, text: 'Great location for evening dinners.' },
    ],
  },
  smokehouse: {
    ratingSummary: '4.7',
    cuisineTags: ['BBQ', 'Smoked meats', 'American comfort'],
    priceBand: 'MDL 260-480 per guest',
    amenities: ['Large portions', 'Family tables', 'Takeaway friendly'],
    reviews: [
      { author: 'Andrei V.', rating: 5, text: 'Ribs and sauces were spot on — worth the wait.' },
      { author: 'Irina M.', rating: 4, text: 'Hearty plates; great for a weekend lunch.' },
    ],
  },
  'attico-terrace-restaurant': {
    ratingSummary: '4.8',
    cuisineTags: ['Rooftop', 'Mediterranean', 'Cocktails'],
    priceBand: 'MDL 320-600 per guest',
    amenities: ['Sunset views', 'Date-night friendly', 'Event hosting'],
    reviews: [
      { author: 'Chris T.', rating: 5, text: 'Elevated terrace experience — perfect for celebrations.' },
      { author: 'Maria G.', rating: 4, text: 'Stylish setting; reservations via the app worked smoothly.' },
    ],
  },
  'garden-restaurant-terrace': {
    ratingSummary: '4.6',
    cuisineTags: ['Seasonal', 'Garden terrace', 'European'],
    priceBand: 'MDL 270-490 per guest',
    amenities: ['Outdoor garden', 'Kids welcome', 'Relaxed pace'],
    reviews: [
      { author: 'Olga P.', rating: 5, text: 'Fresh flavors and a calm garden atmosphere.' },
      { author: 'Sergiu D.', rating: 4, text: 'Nice for family dinner; staff were patient with kids.' },
    ],
  },
  'la-placinte-stefan-cel-mare': {
    ratingSummary: '4.9',
    cuisineTags: ['Moldovan', 'Homemade pies', 'Traditional'],
    priceBand: 'MDL 200-380 per guest',
    amenities: ['Local classics', 'Cozy interior', 'Quick lunch'],
    reviews: [
      { author: 'Victoria R.', rating: 5, text: 'Plăcinte and zeamă tasted like home — highly recommend.' },
      { author: 'Ion B.', rating: 5, text: 'Affordable, filling, and always consistent quality.' },
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
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr),minmax(280px,0.85fr)]">
        <section className="min-w-0 space-y-6">
          <header className="space-y-3 rounded-2xl border border-border/50 bg-surface p-6 shadow-card-strong">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-xs font-medium text-accent-text">
                ★ {detailContent.ratingSummary}
              </span>
              <span>Based on guest feedback</span>
              <span className="text-muted/60">·</span>
              <span className="rounded-full border border-border/60 bg-surface-soft px-2.5 py-1 text-xs font-medium text-foreground/70">
                {restaurant.city}
              </span>
            </div>
          </header>

          <RestaurantPhotoGallery restaurantName={restaurant.name} imageUrls={galleryImages} />

          <section className="max-w-3xl space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">About</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {restaurant.description ??
                'A welcoming place for dining with friends and family. Explore available tables and reserve your preferred time.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                Reservations
              </span>
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                Floor plan
              </span>
              <span className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text">
                QR check-in
              </span>
            </div>
          </section>

          <section className="max-w-3xl space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">Practical info</h2>
            <div className="flex flex-wrap gap-2">
              {detailContent.cuisineTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent-border/70 bg-accent-bg px-2.5 py-1 text-[11px] font-medium text-accent-text"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full border border-border/60 bg-surface-soft px-2.5 py-1 text-[11px] font-medium text-foreground/70">
                {detailContent.priceBand}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {detailContent.amenities.map((item) => (
                <p
                  key={item}
                  className="rounded-xl border border-border/50 bg-surface-soft px-3 py-2.5 text-sm text-foreground/85 shadow-card-soft"
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="max-w-3xl space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Guest reviews</h2>
              <span className="rounded-full border border-border/50 bg-surface-soft px-2.5 py-1 text-[11px] font-medium text-muted">Preview</span>
            </div>
            <div className="space-y-2">
              {detailContent.reviews.map((review, idx) => (
                <article
                  key={`${review.author}-${idx}`}
                  className="rounded-xl border border-border/50 bg-surface-soft px-4 py-3 shadow-card-soft"
                >
                  <p className="text-xs font-medium text-accent-text">
                    {review.author}
                    <span className="ml-2 text-[#FBBD23]">{'★'.repeat(review.rating)}</span>
                  </p>
                  <p className="mt-1.5 text-sm text-foreground/90">{review.text}</p>
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

      <div className="min-w-0 space-y-4 border-t border-border/60 pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Book a table</h2>
          <p className="text-sm text-muted">
            Choose time, party size, and table on the floor plan.
          </p>
        </header>
        <section aria-label="Reservation flow" className="min-w-0 space-y-4">
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

