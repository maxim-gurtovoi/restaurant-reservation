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

const assignManagerSchema = z.object({
  userId: z.string().uuid(),
  restaurantId: z.string().uuid(),
});

const removeManagerAssignmentSchema = z.object({
  linkId: z.string().uuid(),
});

export async function getAdminOverviewData() {
  const [restaurants, managerUsers, managerLinks] = await prisma.$transaction([
    prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, isActive: true },
    }),
    prisma.user.findMany({
      where: { role: 'MANAGER' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    prisma.restaurantManager.findMany({
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

  const managerCountByRestaurantId = new Map<string, number>();
  const restaurantsById = new Map(restaurants.map((r) => [r.id, r]));
  for (const link of managerLinks) {
    managerCountByRestaurantId.set(
      link.restaurantId,
      (managerCountByRestaurantId.get(link.restaurantId) ?? 0) + 1,
    );
  }

  const restaurantsWithoutManagers = restaurants.filter(
    (restaurant) => (managerCountByRestaurantId.get(restaurant.id) ?? 0) === 0,
  );

  const linksByManagerId = new Map<string, string[]>();
  for (const link of managerLinks) {
    const names = linksByManagerId.get(link.userId) ?? [];
    const restaurantName = restaurantsById.get(link.restaurantId)?.name;
    if (restaurantName) names.push(restaurantName);
    linksByManagerId.set(link.userId, names);
  }

  const managersOverview = managerUsers.map((manager) => ({
    ...manager,
    restaurants: (linksByManagerId.get(manager.id) ?? []).sort((a, b) => a.localeCompare(b)),
  }));

  return {
    restaurants,
    managerUsers,
    managerLinks,
    restaurantsWithoutManagers,
    managersOverview,
  };
}

export async function createRestaurantBasic(input: unknown) {
  const parsed = createRestaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid restaurant payload' };
  }

  const exists = await prisma.restaurant.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (exists) {
    return { ok: false as const, error: 'Restaurant slug already exists' };
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

export async function assignManagerToRestaurant(input: unknown) {
  const parsed = assignManagerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid manager assignment payload' };
  }

  const existingLink = await prisma.restaurantManager.findUnique({
    where: {
      userId_restaurantId: {
        userId: parsed.data.userId,
        restaurantId: parsed.data.restaurantId,
      },
    },
    select: { id: true },
  });
  if (existingLink) {
    return { ok: false as const, error: 'Manager is already assigned to this restaurant' };
  }

  const created = await prisma.restaurantManager.create({
    data: {
      userId: parsed.data.userId,
      restaurantId: parsed.data.restaurantId,
    },
    select: { id: true },
  });

  return { ok: true as const, data: created };
}

export async function removeManagerAssignment(input: unknown) {
  const parsed = removeManagerAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid manager assignment payload' };
  }

  const exists = await prisma.restaurantManager.findUnique({
    where: { id: parsed.data.linkId },
    select: { id: true },
  });
  if (!exists) {
    return { ok: false as const, error: 'Manager assignment not found' };
  }

  await prisma.restaurantManager.delete({
    where: { id: parsed.data.linkId },
  });

  return { ok: true as const };
}

