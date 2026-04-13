/**
 * Demo-only supporting content for restaurant detail pages (by slug).
 * Not loaded from the database — keeps the diploma scope simple.
 */

export type ReviewPreview = {
  author: string;
  text: string;
  rating: number;
};

export type MenuPreviewItem = {
  name: string;
  price: string;
};

export type RestaurantDetailSupportingContent = {
  ratingSummary: string;
  cuisineTags: string[];
  priceBand: string;
  amenities: string[];
  reviews: ReviewPreview[];
  menuPreview: MenuPreviewItem[];
};

export const DEFAULT_RESTAURANT_DETAIL_CONTENT: RestaurantDetailSupportingContent = {
  ratingSummary: '4.6',
  cuisineTags: ['Local favorites', 'Casual dining'],
  priceBand: 'MDL 250–450 per guest',
  amenities: ['Reservations', 'Indoor seating', 'Family friendly'],
  reviews: [
    { author: 'Guest', rating: 5, text: 'Great service and a comfortable atmosphere.' },
    { author: 'Alex K.', rating: 4, text: 'Easy booking and friendly staff.' },
  ],
  menuPreview: [
    { name: 'Chef’s soup of the day', price: 'MDL 65' },
    { name: 'House salad', price: 'MDL 85' },
    { name: 'Grilled mains', price: 'from MDL 180' },
  ],
};

export const RESTAURANT_DETAIL_CONTENT_BY_SLUG: Record<string, RestaurantDetailSupportingContent> = {
  gastrobar: {
    ratingSummary: '4.8',
    cuisineTags: ['Cocktail bar', 'Seasonal plates', 'Mediterranean'],
    priceBand: 'MDL 300–550 per guest',
    amenities: ['Live music nights', 'Indoor seating', 'Late kitchen'],
    reviews: [
      { author: 'Natalia H.', rating: 5, text: 'Warm vibe, great cocktails, and quick service.' },
      { author: 'Mihai L.', rating: 4, text: 'Good menu balance and easy table reservation.' },
      { author: 'Doina C.', rating: 5, text: 'Small plates were fresh — perfect with a negroni.' },
    ],
    menuPreview: [
      { name: 'Seasonal tartare', price: 'MDL 145' },
      { name: 'Grilled octopus', price: 'MDL 195' },
      { name: 'Burrata & tomatoes', price: 'MDL 125' },
      { name: 'House cocktail', price: 'from MDL 95' },
    ],
  },
  'pegas-terrace-restaurant': {
    ratingSummary: '4.7',
    cuisineTags: ['Terrace dining', 'European', 'Wine friendly'],
    priceBand: 'MDL 280–500 per guest',
    amenities: ['Outdoor seating', 'Romantic setting', 'City views'],
    reviews: [
      { author: 'Elena S.', rating: 5, text: 'Lovely terrace and very attentive staff.' },
      { author: 'Dan P.', rating: 4, text: 'Great location for evening dinners.' },
      { author: 'Lilia R.', rating: 5, text: 'Wine list paired well with the fish — memorable night.' },
    ],
    menuPreview: [
      { name: 'Terrace mezze board', price: 'MDL 165' },
      { name: 'Grilled sea bass', price: 'MDL 225' },
      { name: 'Beef tenderloin', price: 'MDL 265' },
      { name: 'Tiramisu', price: 'MDL 85' },
    ],
  },
  smokehouse: {
    ratingSummary: '4.7',
    cuisineTags: ['BBQ', 'Smoked meats', 'American comfort'],
    priceBand: 'MDL 260–480 per guest',
    amenities: ['Large portions', 'Family tables', 'Takeaway friendly'],
    reviews: [
      { author: 'Andrei V.', rating: 5, text: 'Ribs and sauces were spot on — worth the wait.' },
      { author: 'Irina M.', rating: 4, text: 'Hearty plates; great for a weekend lunch.' },
      { author: 'Petru S.', rating: 5, text: 'Brisket was tender; sides are made for sharing.' },
    ],
    menuPreview: [
      { name: 'Smoked brisket (200g)', price: 'MDL 185' },
      { name: 'BBQ ribs half rack', price: 'MDL 175' },
      { name: 'Mac & cheese side', price: 'MDL 65' },
      { name: 'House BBQ sauce flight', price: 'MDL 45' },
    ],
  },
  'attico-terrace-restaurant': {
    ratingSummary: '4.8',
    cuisineTags: ['Rooftop', 'Mediterranean', 'Cocktails'],
    priceBand: 'MDL 320–600 per guest',
    amenities: ['Sunset views', 'Date-night friendly', 'Event hosting'],
    reviews: [
      { author: 'Chris T.', rating: 5, text: 'Elevated terrace experience — perfect for celebrations.' },
      { author: 'Maria G.', rating: 4, text: 'Stylish setting; reservations via the app worked smoothly.' },
      { author: 'Julian F.', rating: 5, text: 'Cocktails at sunset — hard to beat this view.' },
    ],
    menuPreview: [
      { name: 'Mezze trio', price: 'MDL 155' },
      { name: 'Seafood risotto', price: 'MDL 215' },
      { name: 'Lamb chops', price: 'MDL 245' },
      { name: 'Aperitivo spritz', price: 'MDL 85' },
    ],
  },
  'garden-restaurant-terrace': {
    ratingSummary: '4.6',
    cuisineTags: ['Seasonal', 'Garden terrace', 'European'],
    priceBand: 'MDL 270–490 per guest',
    amenities: ['Outdoor garden', 'Kids welcome', 'Relaxed pace'],
    reviews: [
      { author: 'Olga P.', rating: 5, text: 'Fresh flavors and a calm garden atmosphere.' },
      { author: 'Sergiu D.', rating: 4, text: 'Nice for family dinner; staff were patient with kids.' },
      { author: 'Ana T.', rating: 5, text: 'Herb-forward dishes — felt light and thoughtful.' },
    ],
    menuPreview: [
      { name: 'Garden gazpacho', price: 'MDL 75' },
      { name: 'Roasted vegetable tart', price: 'MDL 125' },
      { name: 'Herb-crusted chicken', price: 'MDL 165' },
      { name: 'Seasonal fruit sorbet', price: 'MDL 55' },
    ],
  },
  'la-placinte-stefan-cel-mare': {
    ratingSummary: '4.9',
    cuisineTags: ['Moldovan', 'Homemade pies', 'Traditional'],
    priceBand: 'MDL 200–380 per guest',
    amenities: ['Local classics', 'Cozy interior', 'Quick lunch'],
    reviews: [
      { author: 'Victoria R.', rating: 5, text: 'Plăcinte and zeamă tasted like home — highly recommend.' },
      { author: 'Ion B.', rating: 5, text: 'Affordable, filling, and always consistent quality.' },
      { author: 'Cătălina M.', rating: 4, text: 'Busy at lunch but worth it — portions are generous.' },
    ],
    menuPreview: [
      { name: 'Plăcinte cu brânză', price: 'MDL 45' },
      { name: 'Zeamă tradițională', price: 'MDL 75' },
      { name: 'Sarmale cu mămăligă', price: 'MDL 95' },
      { name: 'Plăcintă cu mere', price: 'MDL 40' },
    ],
  },
};

export function getRestaurantDetailSupportingContent(
  slug: string,
): RestaurantDetailSupportingContent {
  return RESTAURANT_DETAIL_CONTENT_BY_SLUG[slug] ?? DEFAULT_RESTAURANT_DETAIL_CONTENT;
}
