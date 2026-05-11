import 'server-only';

import type { RestaurantListItem } from '@/features/restaurants/server/restaurants.service';
import { deriveCity } from '@/features/restaurants/server/restaurants.service';
import { prisma } from '@/lib/prisma';

export async function getFavoriteRestaurantIdSet(userId: string): Promise<Set<string>> {
  const rows = await prisma.favoriteRestaurant.findMany({
    where: { userId },
    select: { restaurantId: true },
  });
  return new Set(rows.map((r) => r.restaurantId));
}

export async function addFavorite(input: {
  userId: string;
  restaurantId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: input.restaurantId, isActive: true },
    select: { id: true },
  });
  if (!restaurant) {
    return { ok: false, error: 'Ресторан не найден' };
  }
  await prisma.favoriteRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: input.userId,
        restaurantId: input.restaurantId,
      },
    },
    create: {
      userId: input.userId,
      restaurantId: input.restaurantId,
    },
    update: {},
  });
  return { ok: true };
}

export async function removeFavorite(input: {
  userId: string;
  restaurantId: string;
}): Promise<void> {
  await prisma.favoriteRestaurant.deleteMany({
    where: {
      userId: input.userId,
      restaurantId: input.restaurantId,
    },
  });
}

export async function listFavoriteRestaurantsForUser(
  userId: string,
): Promise<RestaurantListItem[]> {
  const rows = await prisma.favoriteRestaurant.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        include: { workingHours: true },
      },
    },
  });

  return rows.map(({ restaurant: r }) => ({
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
