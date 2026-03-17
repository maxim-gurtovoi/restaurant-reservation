import 'server-only';
import type { TableShape } from '@prisma/client';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';

export type RestaurantListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  imageUrl: string | null;
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
  workingHours: {
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
};

function deriveCity(address: string | null | undefined): string {
  if (!address) {
    return 'Unknown city';
  }

  // Very simple, explicit heuristic: take the last comma-separated part.
  const parts = address.split(',').map((part) => part.trim());
  const candidate = parts[parts.length - 1];
  return candidate.length > 0 ? candidate : 'Unknown city';
}

export async function listRestaurants(input: {
  city?: string;
}): Promise<ApiResult<RestaurantListItem[]>> {
  const records = await prisma.restaurant.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  let items: RestaurantListItem[] = records.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: deriveCity(r.address),
    imageUrl: r.imageUrl ?? null,
  }));

  if (input.city) {
    const target = input.city.toLowerCase();
    items = items.filter((item) => item.city.toLowerCase() === target);
  }

  return { status: 200, body: items };
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantDetails | null> {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      floorPlans: true,
      tables: true,
      workingHours: true,
    },
  });

  if (!restaurant) {
    return null;
  }

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
    floorPlans: restaurant.floorPlans.map((fp) => ({
      id: fp.id,
      name: fp.name,
      width: fp.width,
      height: fp.height,
    })),
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
