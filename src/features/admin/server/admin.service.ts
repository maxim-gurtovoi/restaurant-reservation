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
        user: { select: { name: true } },
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    restaurants,
    managerUsers,
    managerLinks,
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

