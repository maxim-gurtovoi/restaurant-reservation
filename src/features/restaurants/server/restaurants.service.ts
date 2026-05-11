import 'server-only';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { FloorPlanElementType, RestaurantFeature, TableShape } from '@prisma/client';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';
import { getOpenStatus } from '@/features/restaurants/lib/open-status';
import {
  recommendationScore,
  restaurantEmbeddingText,
} from '@/features/restaurants/lib/recommendation-embedding';
import type { SortOption } from '@/features/restaurants/constants';

export type { SortOption } from '@/features/restaurants/constants';
export { FILTERABLE_FEATURES } from '@/features/restaurants/constants';

export type RestaurantListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  description: string | null;
  imageUrl: string | null;
  cuisine: string | null;
  priceLevel: number | null;
  rating: number | null;
  reviewsCount: number;
  features: RestaurantFeature[];
  workingHours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[];
  timeZone: string | null;
};

export type RestaurantListPage = {
  items: RestaurantListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type RestaurantDetails = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string;
  phone: string | null;
  email: string | null;
  imageUrl: string | null;
  coverImageUrl: string | null;
  cuisine: string | null;
  priceLevel: number | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  googleMapsUrl: string | null;
  rating: number | null;
  reviewsCount: number;
  features: RestaurantFeature[];
  /** IANA TZ from DB, or null to use app default. */
  timeZone: string | null;
  /** Null → app default lead minutes. */
  minBookingLeadMinutes: number | null;
  /** Guests above this require phone; null → no rule. */
  maxGuestsWithoutPhone: number | null;
  blockedRecurrenceJson: unknown | null;
  galleryImages: string[];
  floorPlans: {
    id: string;
    name: string;
    width: number;
    height: number;
  }[];
  tables: {
    id: string;
    floorPlanId: string;
    label: string;
    capacity: number;
    shape: TableShape;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isActive: boolean;
  }[];
  floorPlanElements: {
    id: string;
    floorPlanId: string;
    type: FloorPlanElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    label: string | null;
  }[];
  workingHours: {
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
};

const GALLERY_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const LEGACY_GALLERY_SLUGS: Record<string, string[]> = {
  'la-placinte': ['la-placinte-stefan-cel-mare'],
};

export function deriveCity(address: string | null | undefined): string {
  if (!address) {
    return 'Город не указан';
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return 'Город не указан';
  if (parts.length === 1) return parts[0];

  const streetLikePattern =
    /\b(strada|str\.?|bulevardul|bd\.?|bul\.?|aleea|sos\.?|soseaua|street|st\.?)\b/i;
  const first = parts[0];
  const last = parts[parts.length - 1];
  const firstLooksStreet = streetLikePattern.test(first);
  const lastLooksStreet = streetLikePattern.test(last);

  const candidate =
    lastLooksStreet && !firstLooksStreet ? first : firstLooksStreet && !lastLooksStreet ? last : last;
  return candidate.length > 0 ? candidate : 'Город не указан';
}

async function resolveRestaurantGalleryImages(input: {
  slug: string;
  fallbackImageUrl: string | null;
}): Promise<string[]> {
  const slugCandidates = [input.slug, ...(LEGACY_GALLERY_SLUGS[input.slug] ?? [])];
  for (const slugCandidate of slugCandidates) {
    const folderPath = path.join(process.cwd(), 'public', 'images', 'restaurants', slugCandidate);
    try {
      const entries = await readdir(folderPath, { withFileTypes: true });
      const imageFiles = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => GALLERY_EXTENSIONS.has(path.extname(name).toLowerCase()))
        // Reserve "cover.*" for the hero — it's not shown in the gallery.
        .filter((name) => !/^cover\./i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .slice(0, 6);

      if (imageFiles.length > 0) {
        return imageFiles.map((name) => `/images/restaurants/${slugCandidate}/${name}`);
      }
    } catch {
      // Candidate folder may not exist; try next alias.
    }
  }

  return input.fallbackImageUrl ? [input.fallbackImageUrl] : [];
}

/** Minimal labels required only to read `.tone` from getOpenStatus. */
const OPEN_STATUS_LABELS_STUB = {
  open: '', closed: '', unknown: '',
  dayOff: '', unavailable: '', allDay: '',
  dayNames: {} as Record<number, string>,
};

export type RestaurantSuggestItem = {
  slug: string;
  name: string;
  cuisine: string | null;
};

/**
 * Подсказки для поиска в шапке: быстрый поиск по имени/кухне и ранжирование
 * через лёгкий «векторный» скор (см. `recommendation-embedding.ts`).
 *
 * Substring-фильтр выполняется в БД (`contains` insensitive), скоринг — в памяти
 * по компактному окну (`take: 60`), так как обычно совпадений мало.
 */
export async function suggestRestaurants(input: {
  q: string;
  limit?: number;
}): Promise<RestaurantSuggestItem[]> {
  const q = input.q.trim();
  if (!q) return [];
  const limit = Math.min(20, Math.max(1, input.limit ?? 8));

  const records = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { cuisine: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      slug: true,
      name: true,
      cuisine: true,
      rating: true,
      reviewsCount: true,
      features: true,
    },
    take: 60,
  });

  const scored = records.map((r) => {
    const text = restaurantEmbeddingText({
      name: r.name,
      cuisine: r.cuisine,
      features: r.features,
    });
    return {
      slug: r.slug,
      name: r.name,
      cuisine: r.cuisine,
      score: recommendationScore(q, text, r.rating, r.reviewsCount),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ slug, name, cuisine }) => ({ slug, name, cuisine }));
}

export async function listRestaurants(input: {
  city?: string;
  q?: string;
  sort?: SortOption;
  priceMin?: number;
  priceMax?: number;
  features?: RestaurantFeature[];
  openNow?: boolean;
  /** Если задан вместе с ненулевым `pageSize` — постраничная выдача после фильтров. */
  page?: number;
  /** Не передавайте (или передайте `0`), чтобы вернуть все совпадения одним списком (например API). */
  pageSize?: number;
}): Promise<ApiResult<RestaurantListPage>> {
  // ── price range normalisation ───────────────────────────────────────
  let priceMin = input.priceMin ?? 1;
  let priceMax = input.priceMax ?? 4;
  if (priceMin > priceMax) [priceMin, priceMax] = [priceMax, priceMin];

  // ── DB-side filters (всё, что можем — фильтруем в Postgres) ─────────
  const where: import('@prisma/client').Prisma.RestaurantWhereInput = { isActive: true };

  const q = input.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { cuisine: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (priceMin > 1 || priceMax < 4) {
    where.priceLevel = { gte: priceMin, lte: priceMax };
  }

  if (input.features && input.features.length > 0) {
    where.features = { hasEvery: input.features };
  }

  // ── DB-side sort ─────────────────────────────────────────────────────
  const sort = input.sort ?? 'rating';
  const orderBy: import('@prisma/client').Prisma.RestaurantOrderByWithRelationInput[] =
    sort === 'name'
      ? [{ name: 'asc' }]
      : sort === 'price_asc'
        ? [{ priceLevel: { sort: 'asc', nulls: 'last' } }, { name: 'asc' }]
        : sort === 'price_desc'
          ? [{ priceLevel: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }]
          : [
              { rating: { sort: 'desc', nulls: 'last' } },
              { reviewsCount: 'desc' },
              { name: 'asc' },
            ];

  // ── pagination (если `openNow` активен — пагинируем после фильтра в памяти) ──
  const wantPaginate = input.pageSize !== undefined && input.pageSize > 0;
  const requestedSize = input.pageSize ?? 0;
  const pageSize = wantPaginate
    ? Math.min(100, Math.max(1, Math.floor(requestedSize)))
    : 0;

  // ── city filter (legacy, считается в памяти — производное поле) ─────
  const cityNeedle = input.city?.toLowerCase();

  // workingHours тащим только когда фильтр "открыто сейчас" активен.
  const include = input.openNow ? { workingHours: true } : undefined;

  if (input.openNow || cityNeedle) {
    // Нужен пост-фильтр в памяти → тянем все совпадения, затем нарезаем страницу.
    const records = await prisma.restaurant.findMany({ where, orderBy, include });
    let items: RestaurantListItem[] = records.map(toListItem);

    if (cityNeedle) {
      items = items.filter((it) => it.city.toLowerCase() === cityNeedle);
    }
    if (input.openNow) {
      items = items.filter((item) => {
        const tz = getRestaurantIanaZone({ timeZone: item.timeZone });
        return getOpenStatus(item.workingHours, tz, OPEN_STATUS_LABELS_STUB).tone === 'open';
      });
    }

    const total = items.length;
    const totalPages = wantPaginate ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const page = wantPaginate ? Math.min(Math.max(1, input.page ?? 1), totalPages) : 1;
    const offset = wantPaginate ? (page - 1) * pageSize : 0;
    const pageItems = wantPaginate ? items.slice(offset, offset + pageSize) : items;

    return {
      status: 200,
      body: {
        items: pageItems,
        total,
        page,
        pageSize: wantPaginate ? pageSize : total,
        totalPages,
      },
    };
  }

  // ── Быстрый путь: всё фильтруется в БД, пагинация — `skip/take` ─────
  const total = await prisma.restaurant.count({ where });
  const totalPages = wantPaginate ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const page = wantPaginate ? Math.min(Math.max(1, input.page ?? 1), totalPages) : 1;
  const skip = wantPaginate ? (page - 1) * pageSize : 0;
  const records = await prisma.restaurant.findMany({
    where,
    orderBy,
    ...(wantPaginate ? { skip, take: pageSize } : {}),
  });
  const items = records.map(toListItem);

  return {
    status: 200,
    body: {
      items,
      total,
      page,
      pageSize: wantPaginate ? pageSize : total,
      totalPages,
    },
  };
}

type RestaurantRowWithMaybeHours =
  | import('@prisma/client').Prisma.RestaurantGetPayload<{ include: { workingHours: true } }>
  | import('@prisma/client').Prisma.RestaurantGetPayload<object>;

function toListItem(r: RestaurantRowWithMaybeHours): RestaurantListItem {
  const workingHours =
    'workingHours' in r && Array.isArray(r.workingHours) ? r.workingHours : [];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: deriveCity(r.address),
    address: r.address ?? null,
    description: r.description ?? null,
    imageUrl: r.imageUrl ?? null,
    cuisine: r.cuisine ?? null,
    priceLevel: r.priceLevel ?? null,
    rating: r.rating ?? null,
    reviewsCount: r.reviewsCount,
    features: r.features,
    workingHours: workingHours.map((wh) => ({
      dayOfWeek: wh.dayOfWeek,
      openTime: wh.openTime,
      closeTime: wh.closeTime,
      isClosed: wh.isClosed,
    })),
    timeZone: r.timeZone ?? null,
  };
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantDetails | null> {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      floorPlans: {
        include: {
          elements: true,
        },
      },
      tables: true,
      workingHours: true,
    },
  });

  if (!restaurant) {
    return null;
  }

  // Гарантированно дёшево, но всё равно файловый I/O — параллелить с дальнейшим
  // mapping-ом не успеваем, но пинаем сразу, пока маппится остальной payload.
  const galleryImagesPromise = resolveRestaurantGalleryImages({
    slug: restaurant.slug,
    fallbackImageUrl: restaurant.imageUrl ?? null,
  });
  const galleryImages = await galleryImagesPromise;

  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description ?? null,
    address: restaurant.address,
    city: deriveCity(restaurant.address),
    phone: restaurant.phone ?? null,
    email: restaurant.email ?? null,
    imageUrl: restaurant.imageUrl ?? null,
    coverImageUrl: restaurant.coverImageUrl ?? restaurant.imageUrl ?? null,
    cuisine: restaurant.cuisine ?? null,
    priceLevel: restaurant.priceLevel ?? null,
    websiteUrl: restaurant.websiteUrl ?? null,
    instagramUrl: restaurant.instagramUrl ?? null,
    facebookUrl: restaurant.facebookUrl ?? null,
    googleMapsUrl: restaurant.googleMapsUrl ?? null,
    rating: restaurant.rating ?? null,
    reviewsCount: restaurant.reviewsCount,
    features: restaurant.features,
    timeZone: restaurant.timeZone ?? null,
    minBookingLeadMinutes: restaurant.minBookingLeadMinutes ?? null,
    maxGuestsWithoutPhone: restaurant.maxGuestsWithoutPhone ?? null,
    blockedRecurrenceJson: restaurant.blockedRecurrenceJson ?? null,
    galleryImages,
    floorPlans: restaurant.floorPlans.map((fp) => ({
      id: fp.id,
      name: fp.name,
      width: fp.width,
      height: fp.height,
    })),
    floorPlanElements: restaurant.floorPlans.flatMap((fp) =>
      fp.elements.map((el) => ({
        id: el.id,
        floorPlanId: el.floorPlanId,
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        label: el.label,
      })),
    ),
    tables: restaurant.tables.map((t) => ({
      id: t.id,
      floorPlanId: t.floorPlanId,
      label: t.label,
      capacity: t.capacity,
      shape: t.shape,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      rotation: t.rotation,
      isActive: t.isActive,
    })),
    workingHours: restaurant.workingHours.map((wh) => ({
      id: wh.id,
      dayOfWeek: wh.dayOfWeek,
      openTime: wh.openTime,
      closeTime: wh.closeTime,
      isClosed: wh.isClosed,
    })),
  };
}

export async function listSimilarRestaurants(input: {
  excludeSlug: string;
  limit?: number;
}): Promise<RestaurantListItem[]> {
  const limit = input.limit ?? 4;
  const records = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      slug: { not: input.excludeSlug },
    },
    orderBy: [
      { rating: 'desc' },
      { reviewsCount: 'desc' },
      { name: 'asc' },
    ],
    take: limit,
    include: { workingHours: true },
  });

  return records.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: deriveCity(r.address),
    address: r.address ?? null,
    description: r.description ?? null,
    imageUrl: r.imageUrl ?? null,
    cuisine: r.cuisine ?? null,
    priceLevel: r.priceLevel ?? null,
    rating: r.rating ?? null,
    reviewsCount: r.reviewsCount,
    features: r.features,
    workingHours: r.workingHours.map((wh) => ({
      dayOfWeek: wh.dayOfWeek,
      openTime: wh.openTime,
      closeTime: wh.closeTime,
      isClosed: wh.isClosed,
    })),
    timeZone: r.timeZone ?? null,
  }));
}
