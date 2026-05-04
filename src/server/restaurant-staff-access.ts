import 'server-only';

import type { Prisma } from '@prisma/client';

/**
 * Staff (ADMIN link) or hall manager (Restaurant.managerUserId) may access the restaurant.
 */
export function reservationWhereStaffOrManager(
  userId: string,
): Prisma.ReservationWhereInput {
  return {
    OR: [
      { restaurant: { admins: { some: { userId } } } },
      { restaurant: { managerUserId: userId } },
    ],
  };
}

export function restaurantWhereStaffOrManager(userId: string): Prisma.RestaurantWhereInput {
  return {
    OR: [{ admins: { some: { userId } } }, { managerUserId: userId }],
  };
}
