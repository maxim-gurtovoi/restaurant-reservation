import 'server-only';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { TableShape } from '@prisma/client';
import type { ApiResult } from '@/types/common';
import { prisma } from '@/lib/prisma';

export type RestaurantListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  description: string | null;
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
  galleryImages: string[];
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

const GALLERY_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function deriveCity(address: string | null | undefined): string {
  if (!address) {
    return 'Unknown city';
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return 'Unknown city';
  if (parts.length === 1) return parts[0];

  const streetLikePattern =
    /\b(strada|str\.?|bulevardul|bd\.?|bul\.?|aleea|sos\.?|soseaua|street|st\.?)\b/i;
  const first = parts[0];
  const last = parts[parts.length - 1];
  const firstLooksStreet = streetLikePattern.test(first);
  const lastLooksStreet = streetLikePattern.test(last);

  const candidate =
    lastLooksStreet && !firstLooksStreet ? first : firstLooksStreet && !lastLooksStreet ? last : last;
  return candidate.length > 0 ? candidate : 'Unknown city';
}

async function resolveRestaurantGalleryImages(input: {
  slug: string;
  fallbackImageUrl: string | null;
}): Promise<string[]> {
  const folderPath = path.join(process.cwd(), 'public', 'images', 'restaurants', input.slug);
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const imageFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => GALLERY_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .slice(0, 6);

    if (imageFiles.length > 0) {
      return imageFiles.map((name) => `/images/restaurants/${input.slug}/${name}`);
    }
  } catch {
    // If folder is missing, we simply fall back to preview image.
  }

  return input.fallbackImageUrl ? [input.fallbackImageUrl] : [];
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
    address: r.address ?? null,
    description: r.description ?? null,
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

  const galleryImages = await resolveRestaurantGalleryImages({
    slug: restaurant.slug,
    fallbackImageUrl: restaurant.imageUrl ?? null,
  });

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
    galleryImages,
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
