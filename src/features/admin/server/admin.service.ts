import 'server-only';
import type {
  FloorPlanElementType,
  Prisma,
  ReservationStatus,
  TableShape,
} from '@prisma/client';
import { DateTime } from 'luxon';
import type { ApiResult } from '@/types/common';
import type {
  AdminTodaySummary,
  StatusFilter,
  TimeFilter,
} from '@/features/admin/lib/admin-reservation-filters';
import { prisma } from '@/lib/prisma';
import { getAppDefaultTimeZone } from '@/lib/restaurant-time';

export type AdminReservationDetails = {
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

export type AdminDashboardStats = {
  todayReservations: number;
  upcomingReservations: number;
  checkedInToday: number;
  adminRestaurants: number;
};

export type AdminReservationListItem = {
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

export type AdminReservationsPage = {
  items: AdminReservationListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function adminReservationScope(adminUserId: string): Prisma.ReservationWhereInput {
  return {
    restaurant: {
      admins: {
        some: {
          userId: adminUserId,
        },
      },
    },
  };
}

/** Extra `where` for list filters (status + calendar window in app default TZ). */
function adminReservationListFilters(
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

function buildAdminReservationListWhere(
  adminUserId: string,
  status: StatusFilter,
  time: TimeFilter,
): Prisma.ReservationWhereInput {
  const scope = adminReservationScope(adminUserId);
  const filters = adminReservationListFilters(status, time);
  if (Object.keys(filters).length === 0) {
    return scope;
  }
  return { AND: [scope, filters] };
}

/** Aggregates for the summary strip (today in app default TZ, all admin-scoped restaurants). */
export async function getAdminTodayReservationSummary(
  adminUserId: string,
): Promise<AdminTodaySummary> {
  const zone = getAppDefaultTimeZone();
  const wall = DateTime.now().setZone(zone);
  const startToday = wall.startOf('day').toUTC().toJSDate();
  const startTomorrow = wall.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
  const scope = adminReservationScope(adminUserId);

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

export async function listAdminReservations(input: {
  adminUserId: string;
  page?: number;
  pageSize?: number;
  status?: StatusFilter;
  time?: TimeFilter;
}): Promise<ApiResult<AdminReservationsPage>> {
  const requestedPage = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(100, Math.max(5, Math.floor(input.pageSize ?? 30)));
  const status = input.status ?? 'all';
  const time = input.time ?? 'all';
  const where = buildAdminReservationListWhere(input.adminUserId, status, time);

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

  const dto: AdminReservationListItem[] = reservations.map((r) => ({
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

export async function listAdminReservationsAll(input: {
  adminUserId: string;
}): Promise<ApiResult<AdminReservationListItem[]>> {
  const reservations = await prisma.reservation.findMany({
    where: {
      restaurant: {
        admins: {
          some: {
            userId: input.adminUserId,
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

  const dto: AdminReservationListItem[] = reservations.map((r) => ({
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

export async function getAdminDashboardStats(input: {
  adminUserId: string;
}): Promise<AdminDashboardStats> {
  const now = new Date();
  const zone = getAppDefaultTimeZone();
  const wall = DateTime.now().setZone(zone);
  const startOfDay = wall.startOf('day').toUTC().toJSDate();
  const startOfTomorrow = wall.plus({ days: 1 }).startOf('day').toUTC().toJSDate();

  const adminRestaurantWhere = {
    restaurant: {
      admins: {
        some: {
          userId: input.adminUserId,
        },
      },
    },
  } as const;

  const [todayReservations, upcomingReservations, checkedInToday, adminRestaurants] =
    await prisma.$transaction([
      prisma.reservation.count({
        where: {
          ...adminRestaurantWhere,
          startAt: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.reservation.count({
        where: {
          ...adminRestaurantWhere,
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
          ...adminRestaurantWhere,
          status: 'CHECKED_IN',
          checkedInAt: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.restaurantAdmin.count({
        where: {
          userId: input.adminUserId,
        },
      }),
    ]);

  return {
    todayReservations,
    upcomingReservations,
    checkedInToday,
    adminRestaurants,
  };
}

export async function getReservationDetailsForAdmin(input: {
  reservationId: string;
  adminUserId: string;
}): Promise<AdminReservationDetails | null> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      restaurant: {
        admins: {
          some: { userId: input.adminUserId },
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

export type AdminFloorPlanRestaurantOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminFloorPlanContext = {
  restaurant: AdminFloorPlanRestaurantOption | null;
  restaurants: AdminFloorPlanRestaurantOption[];
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
  elements: {
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
};

export async function getAdminFloorPlanContext(input: {
  adminUserId: string;
  restaurantId?: string | null;
}): Promise<AdminFloorPlanContext> {
  const links = await prisma.restaurantAdmin.findMany({
    where: { userId: input.adminUserId },
    select: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          floorPlans: {
            orderBy: { name: 'asc' },
            include: { elements: true },
          },
          tables: true,
        },
      },
    },
    orderBy: { restaurant: { name: 'asc' } },
  });

  const restaurants: AdminFloorPlanRestaurantOption[] = links.map((l) => ({
    id: l.restaurant.id,
    name: l.restaurant.name,
    slug: l.restaurant.slug,
  }));

  if (!restaurants.length) {
    return {
      restaurant: null,
      restaurants: [],
      floorPlans: [],
      tables: [],
      elements: [],
    };
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
    elements: r.floorPlans.flatMap((fp) =>
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
  };
}
