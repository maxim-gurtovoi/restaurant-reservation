import type { RestaurantFeature } from '@prisma/client';
import type { SortOption } from '@/features/restaurants/constants';

/** Состояние фильтров главного списка (без номера страницы). */
export type RestaurantListingBase = {
  q: string;
  sort: SortOption;
  priceMin: number;
  priceMax: number;
  features: RestaurantFeature[];
  openNow: boolean;
};

/** Путь `/?…` с теми же фильтрами и заданной страницей (`page` только если > 1). */
export function buildRestaurantListingHref(base: RestaurantListingBase, page: number): string {
  const sp = new URLSearchParams();
  const q = base.q.trim();
  if (q) sp.set('q', q);
  if (base.sort !== 'rating') sp.set('sort', base.sort);
  if (base.priceMin > 1) sp.set('pmin', String(base.priceMin));
  if (base.priceMax < 4) sp.set('pmax', String(base.priceMax));
  if (base.features.length > 0) sp.set('feat', base.features.join(','));
  if (base.openNow) sp.set('open', '1');
  if (page > 1) sp.set('page', String(page));
  const str = sp.toString();
  return str ? `/?${str}` : page > 1 ? `/?page=${page}` : '/';
}
