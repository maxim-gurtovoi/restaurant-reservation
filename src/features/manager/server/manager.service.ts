import 'server-only';
import type { UserRole } from '@prisma/client';
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

function buildOverviewFromParts(params: {
  restaurants: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }[];
  adminUsers: { id: string; name: string; email: string }[];
  adminLinks: {
    id: string;
    userId: string;
    restaurantId: string;
    user: { name: string; email: string };
    restaurant: { name: string };
  }[];
  restaurantsWithoutManagers?: { id: string; name: string; slug: string; isActive: boolean }[];
}) {
  const { restaurants, adminUsers, adminLinks, restaurantsWithoutManagers } = params;

  const restaurantsById = new Map(restaurants.map((r) => [r.id, r]));

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
    restaurantsWithoutManagers: restaurantsWithoutManagers ?? [],
    adminsOverview,
  };
}

/**
 * OWNER: all restaurants and assignments (platform).
 * MANAGER: single managed restaurant (`Restaurant.managerUserId`) and its links only.
 */
export async function getManagerOverviewData(params: { userId: string; role: UserRole }) {
  const adminUserSelect = {
    id: true,
    name: true,
    email: true,
  } as const;

  const linkSelect = {
    id: true,
    userId: true,
    restaurantId: true,
    user: { select: { name: true, email: true } },
    restaurant: { select: { name: true } },
  } as const;

  if (params.role === 'OWNER') {
    const [restaurants, adminUsers, adminLinks] = await prisma.$transaction([
      prisma.restaurant.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, isActive: true, managerUserId: true },
      }),
      prisma.user.findMany({
        where: { role: 'ADMIN' },
        orderBy: { name: 'asc' },
        select: adminUserSelect,
      }),
      prisma.restaurantAdmin.findMany({
        select: linkSelect,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const restaurantsWithoutManagers = restaurants
      .filter((r) => r.managerUserId == null)
      .map(({ managerUserId: _m, ...rest }) => rest);

    const stripped = restaurants.map(({ managerUserId: _m, ...rest }) => rest);

    return {
      ...buildOverviewFromParts({
        restaurants: stripped,
        adminUsers,
        adminLinks,
        restaurantsWithoutManagers,
      }),
      managedRestaurant: null as null,
    };
  }

  if (params.role !== 'MANAGER') {
    return {
      restaurants: [],
      adminUsers: [],
      adminLinks: [],
      restaurantsWithoutManagers: [],
      adminsOverview: [],
      managedRestaurant: null as null,
    };
  }

  const managed = await prisma.restaurant.findFirst({
    where: { managerUserId: params.userId },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  if (!managed) {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { name: 'asc' },
      select: adminUserSelect,
    });
    return {
      ...buildOverviewFromParts({
        restaurants: [],
        adminUsers,
        adminLinks: [],
      }),
      managedRestaurant: null as null,
    };
  }

  const [adminUsers, adminLinks] = await prisma.$transaction([
    prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { name: 'asc' },
      select: adminUserSelect,
    }),
    prisma.restaurantAdmin.findMany({
      where: { restaurantId: managed.id },
      select: linkSelect,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    ...buildOverviewFromParts({
      restaurants: [managed],
      adminUsers,
      adminLinks,
    }),
    managedRestaurant: managed,
  };
}

export async function createRestaurantBasic(
  input: unknown,
  actor: { role: UserRole },
) {
  if (actor.role !== 'OWNER') {
    return { ok: false as const, error: 'Создание ресторана доступно только владельцу платформы' };
  }

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

export async function assignAdminToRestaurant(
  input: unknown,
  actor: { userId: string; role: UserRole },
) {
  if (actor.role === 'OWNER') {
    return { ok: false as const, error: 'Назначение администраторов выполняет управляющий ресторана' };
  }
  if (actor.role !== 'MANAGER') {
    return { ok: false as const, error: 'Недостаточно прав' };
  }

  const parsed = assignAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Некорректные данные назначения администратора' };
  }

  const managed = await prisma.restaurant.findFirst({
    where: { managerUserId: actor.userId },
    select: { id: true },
  });
  if (!managed || managed.id !== parsed.data.restaurantId) {
    return { ok: false as const, error: 'Можно назначать администраторов только в своём ресторане' };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });
  if (!target || target.role !== 'ADMIN') {
    return { ok: false as const, error: 'Пользователь не является администратором зала' };
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

export async function removeAdminAssignment(
  input: unknown,
  actor: { userId: string; role: UserRole },
) {
  if (actor.role === 'OWNER') {
    return { ok: false as const, error: 'Снятие назначений выполняет управляющий ресторана' };
  }
  if (actor.role !== 'MANAGER') {
    return { ok: false as const, error: 'Недостаточно прав' };
  }

  const parsed = removeAdminAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Некорректные данные назначения администратора' };
  }

  const row = await prisma.restaurantAdmin.findUnique({
    where: { id: parsed.data.linkId },
    select: { id: true, restaurantId: true },
  });
  if (!row) {
    return { ok: false as const, error: 'Связь администратора с рестораном не найдена' };
  }

  const managed = await prisma.restaurant.findFirst({
    where: { managerUserId: actor.userId },
    select: { id: true },
  });
  if (!managed || managed.id !== row.restaurantId) {
    return { ok: false as const, error: 'Нельзя снять назначение в чужом ресторане' };
  }

  await prisma.restaurantAdmin.delete({
    where: { id: parsed.data.linkId },
  });

  return { ok: true as const };
}
