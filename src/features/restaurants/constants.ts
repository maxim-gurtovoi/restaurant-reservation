import type { RestaurantFeature } from '@prisma/client';

export type SortOption = 'rating' | 'name' | 'price_asc' | 'price_desc';

export const FILTERABLE_FEATURES: RestaurantFeature[] = [
  'TERRACE',
  'LIVE_MUSIC',
  'WIFI',
  'PARKING',
  'FAMILY_FRIENDLY',
  'PET_FRIENDLY',
];

/** Карточки ресторанов на главной (URL `page`). */
export const RESTAURANTS_LIST_PAGE_SIZE = 12;
