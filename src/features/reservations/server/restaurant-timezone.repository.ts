import 'server-only';

import { prisma } from '@/lib/prisma';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';

export async function getRestaurantIanaZoneById(restaurantId: string): Promise<string> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { timeZone: true },
  });
  return getRestaurantIanaZone(restaurant ?? { timeZone: null });
}
