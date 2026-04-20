import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createRestaurantSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  address: z.string().min(3).max(200),
  description: z.string().min(10).max(500).optional(),
  phone: z.string().max(50).optional(),
});

const assignAdminSchema = z.object({
  userId: z.string().uuid(),
  restaurantId: z.string().uuid(),
});

const removeAdminAssignmentSchema = z.object({
  linkId: z.string().uuid(),
});

/**
 * Data for the manager (top-tier) overview: all restaurants and their hall-admin assignments.
 * Manager role can also act as admin anywhere, but this screen focuses on operational setup.
 */
export async function getManagerOverviewData() {
  const [restaurants, adminUsers, adminLinks] = await prisma.$transaction([
    prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, isActive: true },
    }),
    prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    prisma.restaurantAdmin.findMany({
      select: {
        id: true,
        userId: true,
        restaurantId: true,
        user: { select: { name: true, email: true } },
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const adminCountByRestaurantId = new Map<string, number>();
  const restaurantsById = new Map(restaurants.map((r) => [r.id, r]));
  for (const link of adminLinks) {
    adminCountByRestaurantId.set(
      link.restaurantId,
      (adminCountByRestaurantId.get(link.restaurantId) ?? 0) + 1,
    );
  }

  const restaurantsWithoutAdmins = restaurants.filter(
    (restaurant) => (adminCountByRestaurantId.get(restaurant.id) ?? 0) === 0,
  );

  const linksByAdminId = new Map<string, string[]>();
  for (const link of adminLinks) {
    const names = linksByAdminId.get(link.userId) ?? [];
    const restaurantName = restaurantsById.get(link.restaurantId)?.name;
    if (restaurantName) names.push(restaurantName);
    linksByAdminId.set(link.userId, names);
  }

  const adminsOverview = adminUsers.map((admin) => ({
    ...admin,
    restaurants: (linksByAdminId.get(admin.id) ?? []).sort((a, b) => a.localeCompare(b)),
  }));

  return {
    restaurants,
    adminUsers,
    adminLinks,
    restaurantsWithoutAdmins,
    adminsOverview,
  };
}

export async function createRestaurantBasic(input: unknown) {
  const parsed = createRestaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Некорректные данные ресторана' };
  }

  const exists = await prisma.restaurant.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (exists) {
    return { ok: false as const, error: 'Ресторан с таким slug уже существует' };
  }

  const created = await prisma.restaurant.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      address: parsed.data.address,
      description: parsed.data.description ?? null,
      phone: parsed.data.phone ?? null,
      isActive: true,
    },
    select: { id: true, name: true },
  });

  return { ok: true as const, data: created };
}

export async function assignAdminToRestaurant(input: unknown) {
  const parsed = assignAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Некорректные данные назначения администратора' };
  }

  const existingLink = await prisma.restaurantAdmin.findUnique({
    where: {
      userId_restaurantId: {
        userId: parsed.data.userId,
        restaurantId: parsed.data.restaurantId,
      },
    },
    select: { id: true },
  });
  if (existingLink) {
    return { ok: false as const, error: 'Этот администратор уже назначен на ресторан' };
  }

  const created = await prisma.restaurantAdmin.create({
    data: {
      userId: parsed.data.userId,
      restaurantId: parsed.data.restaurantId,
    },
    select: { id: true },
  });

  return { ok: true as const, data: created };
}

export async function removeAdminAssignment(input: unknown) {
  const parsed = removeAdminAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Некорректные данные назначения администратора' };
  }

  const exists = await prisma.restaurantAdmin.findUnique({
    where: { id: parsed.data.linkId },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false as const, error: 'Связь администратора с рестораном не найдена' };
  }

  await prisma.restaurantAdmin.delete({
    where: { id: parsed.data.linkId },
  });

  return { ok: true as const };
}
