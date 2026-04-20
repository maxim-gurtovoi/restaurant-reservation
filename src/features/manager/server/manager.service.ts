import 'server-only';
import type { Prisma, ReservationStatus, TableShape } from '@prisma/client';
import { DateTime } from 'luxon';
import type { ApiResult } from '@/types/common';
import type {
  ManagerTodaySummary,
  StatusFilter,
  TimeFilter,
} from '@/features/manager/lib/manager-reservation-filters';
import { prisma } from '@/lib/prisma';
import { getAppDefaultTimeZone } from '@/lib/restaurant-time';

export type ManagerReservationDetails = {
  id: string;
  referenceCode: string;
  status: ReservationStatus;
  guestCount: number;
  startAt: Date;
  endAt: Date;
  qrToken: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  cancelledAt: Date | null;
  checkedInAt: Date | null;
  createdAt: Date;
  restaurant: { name: string };
  table: { label: string };
};

export type ManagerDashboardStats = {
  todayReservations: number;
  upcomingReservations: number;
  checkedInToday: number;
  managedRestaurants: number;
};

export type ManagerReservationListItem = {
  id: string;
  referenceCode: string;
  status: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  checkedInAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  restaurant: {
    name: string;
  };
  table: {
    label: string;
  };
  contactName: string;
  qrToken: string;
};

export type ManagerReservationsPage = {
  items: ManagerReservationListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function managerReservationScope(managerUserId: string): Prisma.ReservationWhereInput {
  return {
    restaurant: {
      managers: {
        some: {
          userId: managerUserId,
        },
      },
    },
  };
}

/** Extra `where` for list filters (status + calendar window in app default TZ). */
function managerReservationListFilters(
  status: StatusFilter,
  time: TimeFilter,
): Prisma.ReservationWhereInput {
  const parts: Prisma.ReservationWhereInput[] = [];
  if (status !== 'all') {
    parts.push({ status });
  }
  if (time !== 'all') {
    const zone = getAppDefaultTimeZone();
    const wall = DateTime.now().setZone(zone);
    const startToday = wall.startOf('day').toUTC().toJSDate();
    const startTomorrow = wall.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
    const nowUtc = new Date();
    if (time === 'today') {
      parts.push({ startAt: { gte: startToday, lt: startTomorrow } });
    } else if (time === 'upcoming') {
      parts.push({ startAt: { gte: startTomorrow } });
    } else {
      parts.push({
        OR: [{ endAt: { lt: nowUtc } }, { startAt: { lt: startToday } }],
      });
    }
  }
  return parts.length ? { AND: parts } : {};
}

function buildManagerReservationListWhere(
  managerUserId: string,
  status: StatusFilter,
  time: TimeFilter,
): Prisma.ReservationWhereInput {
  const scope = managerReservationScope(managerUserId);
  const filters = managerReservationListFilters(status, time);
  if (Object.keys(filters).length === 0) {
    return scope;
  }
  return { AND: [scope, filters] };
}

/** Aggregates for the summary strip (today in app default TZ, all managed restaurants). */
export async function getManagerTodayReservationSummary(
  managerUserId: string,
): Promise<ManagerTodaySummary> {
  const zone = getAppDefaultTimeZone();
  const wall = DateTime.now().setZone(zone);
  const startToday = wall.startOf('day').toUTC().toJSDate();
  const startTomorrow = wall.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
  const scope = managerReservationScope(managerUserId);

  const [confirmed, checkedIn, completed, noShow] = await prisma.$transaction([
    prisma.reservation.count({
      where: {
        ...scope,
        status: 'CONFIRMED',
        startAt: { gte: startToday, lt: startTomorrow },
      },
    }),
    prisma.reservation.count({
      where: {
        ...scope,
        status: 'CHECKED_IN',
        checkedInAt: { gte: startToday, lt: startTomorrow },
      },
    }),
    prisma.reservation.count({
      where: {
        ...scope,
        status: 'COMPLETED',
        startAt: { gte: startToday, lt: startTomorrow },
      },
    }),
    prisma.reservation.count({
      where: {
        ...scope,
        status: 'NO_SHOW',
        startAt: { gte: startToday, lt: startTomorrow },
      },
    }),
  ]);

  return { confirmed, checkedIn, completed, noShow };
}

export async function listManagerReservations(input: {
  managerUserId: string;
  page?: number;
  pageSize?: number;
  status?: StatusFilter;
  time?: TimeFilter;
}): Promise<ApiResult<ManagerReservationsPage>> {
  const requestedPage = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(100, Math.max(5, Math.floor(input.pageSize ?? 30)));
  const status = input.status ?? 'all';
  const time = input.time ?? 'all';
  const where = buildManagerReservationListWhere(input.managerUserId, status, time);

  const total = await prisma.reservation.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [
        { startAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: pageSize,
      select: {
        id: true,
        referenceCode: true,
        status: true,
        guestCount: true,
        startAt: true,
        endAt: true,
        checkedInAt: true,
        cancelledAt: true,
        createdAt: true,
        qrToken: true,
        contactName: true,
        restaurant: {
          select: {
            name: true,
          },
        },
        table: {
          select: {
            label: true,
          },
        },
      },
    });

  const dto: ManagerReservationListItem[] = reservations.map((r) => ({
    id: r.id,
    referenceCode: r.referenceCode,
    status: r.status,
    guestCount: r.guestCount,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt.toISOString(),
    checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
    cancelledAt: r.cancelledAt ? r.cancelledAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    restaurant: r.restaurant,
    table: r.table,
    contactName: r.contactName,
    qrToken: r.qrToken,
  }));

  return {
    status: 200,
    body: {
      items: dto,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function listManagerReservationsAll(input: {
  managerUserId: string;
}): Promise<ApiResult<ManagerReservationListItem[]>> {
  const reservations = await prisma.reservation.findMany({
    where: {
      restaurant: {
        managers: {
          some: {
            userId: input.managerUserId,
          },
        },
      },
    },
    orderBy: [
      { startAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      referenceCode: true,
      status: true,
      guestCount: true,
      startAt: true,
      endAt: true,
      checkedInAt: true,
      cancelledAt: true,
      createdAt: true,
      qrToken: true,
      contactName: true,
      restaurant: {
        select: {
          name: true,
        },
      },
      table: {
        select: {
          label: true,
        },
      },
    },
  });

  const dto: ManagerReservationListItem[] = reservations.map((r) => ({
    id: r.id,
    referenceCode: r.referenceCode,
    status: r.status,
    guestCount: r.guestCount,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt.toISOString(),
    checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
    cancelledAt: r.cancelledAt ? r.cancelledAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    restaurant: r.restaurant,
    table: r.table,
    contactName: r.contactName,
    qrToken: r.qrToken,
  }));

  return { status: 200, body: dto };
}

export async function getManagerDashboardStats(input: {
  managerUserId: string;
}): Promise<ManagerDashboardStats> {
  const now = new Date();
  const zone = getAppDefaultTimeZone();
  const wall = DateTime.now().setZone(zone);
  const startOfDay = wall.startOf('day').toUTC().toJSDate();
  const startOfTomorrow = wall.plus({ days: 1 }).startOf('day').toUTC().toJSDate();

  const managerRestaurantWhere = {
    restaurant: {
      managers: {
        some: {
          userId: input.managerUserId,
        },
      },
    },
  } as const;

  const [todayReservations, upcomingReservations, checkedInToday, managedRestaurants] =
    await prisma.$transaction([
      prisma.reservation.count({
        where: {
          ...managerRestaurantWhere,
          startAt: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.reservation.count({
        where: {
          ...managerRestaurantWhere,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
          startAt: {
            gte: now,
          },
        },
      }),
      prisma.reservation.count({
        where: {
          ...managerRestaurantWhere,
          status: 'CHECKED_IN',
          checkedInAt: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.restaurantManager.count({
        where: {
          userId: input.managerUserId,
        },
      }),
    ]);

  return {
    todayReservations,
    upcomingReservations,
    checkedInToday,
    managedRestaurants,
  };
}

export async function getReservationDetailsForManager(input: {
  reservationId: string;
  managerUserId: string;
}): Promise<ManagerReservationDetails | null> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      restaurant: {
        managers: {
          some: { userId: input.managerUserId },
        },
      },
    },
    include: {
      restaurant: { select: { name: true } },
      table: { select: { label: true } },
    },
  });

  if (!reservation) return null;

  return {
    id: reservation.id,
    referenceCode: reservation.referenceCode,
    status: reservation.status,
    guestCount: reservation.guestCount,
    startAt: reservation.startAt,
    endAt: reservation.endAt,
    qrToken: reservation.qrToken,
    contactName: reservation.contactName,
    contactPhone: reservation.contactPhone,
    contactEmail: reservation.contactEmail,
    cancelledAt: reservation.cancelledAt,
    checkedInAt: reservation.checkedInAt,
    createdAt: reservation.createdAt,
    restaurant: reservation.restaurant,
    table: reservation.table,
  };
}

export type ManagerFloorPlanRestaurantOption = {
  id: string;
  name: string;
  slug: string;
};

export type ManagerFloorPlanContext = {
  restaurant: ManagerFloorPlanRestaurantOption | null;
  restaurants: ManagerFloorPlanRestaurantOption[];
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
};

export async function getManagerFloorPlanContext(input: {
  managerUserId: string;
  restaurantId?: string | null;
}): Promise<ManagerFloorPlanContext> {
  const links = await prisma.restaurantManager.findMany({
    where: { userId: input.managerUserId },
    select: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          floorPlans: { orderBy: { name: 'asc' } },
          tables: true,
        },
      },
    },
    orderBy: { restaurant: { name: 'asc' } },
  });

  const restaurants: ManagerFloorPlanRestaurantOption[] = links.map((l) => ({
    id: l.restaurant.id,
    name: l.restaurant.name,
    slug: l.restaurant.slug,
  }));

  if (!restaurants.length) {
    return { restaurant: null, restaurants: [], floorPlans: [], tables: [] };
  }

  const requestedId =
    typeof input.restaurantId === 'string' && input.restaurantId.length > 0
      ? input.restaurantId
      : null;
  const allowed = requestedId && restaurants.some((r) => r.id === requestedId);
  const selectedId = allowed ? requestedId! : restaurants[0]!.id;
  const row = links.find((l) => l.restaurant.id === selectedId)!;
  const r = row.restaurant;

  return {
    restaurant: { id: r.id, name: r.name, slug: r.slug },
    restaurants,
    floorPlans: r.floorPlans.map((fp) => ({
      id: fp.id,
      name: fp.name,
      width: fp.width,
      height: fp.height,
    })),
    tables: r.tables.map((t) => ({
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
  };
}

