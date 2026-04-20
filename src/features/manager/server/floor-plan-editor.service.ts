import 'server-only';
import { z } from 'zod';
import type { FloorPlanElementType, TableShape } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type EditableTable = {
  id: string;
  label: string;
  capacity: number;
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isActive: boolean;
};

export type EditableElement = {
  id: string;
  type: FloorPlanElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string | null;
};

export type FloorPlanEditorContext = {
  restaurant: { id: string; name: string; slug: string };
  floorPlan: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  tables: EditableTable[];
  elements: EditableElement[];
  otherFloors: { id: string; name: string }[];
};

export async function getFloorPlanEditorContext(
  floorPlanId: string,
): Promise<FloorPlanEditorContext | null> {
  const floorPlan = await prisma.floorPlan.findUnique({
    where: { id: floorPlanId },
    include: {
      tables: { orderBy: { label: 'asc' } },
      elements: { orderBy: { createdAt: 'asc' } },
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          floorPlans: {
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  });

  if (!floorPlan) return null;

  return {
    restaurant: floorPlan.restaurant,
    floorPlan: {
      id: floorPlan.id,
      name: floorPlan.name,
      width: floorPlan.width,
      height: floorPlan.height,
    },
    tables: floorPlan.tables.map((t) => ({
      id: t.id,
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
    elements: floorPlan.elements.map((e) => ({
      id: e.id,
      type: e.type,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
      rotation: e.rotation,
      label: e.label,
    })),
    otherFloors: floorPlan.restaurant.floorPlans.filter((f) => f.id !== floorPlan.id),
  };
}

// Use nullable UUID ids so the editor can send client-only ids for newly-added items.
// Server replaces the whole set per save (delete+recreate) — simpler than diff-based updates.
const tableSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1).max(12),
  capacity: z.number().int().min(1).max(30),
  shape: z.enum(['ROUND', 'SQUARE', 'RECTANGLE']),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(24).max(600),
  height: z.number().int().min(24).max(600),
  rotation: z.number().int().min(-360).max(360).default(0),
  isActive: z.boolean().default(true),
});

const elementSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum([
    'BAR_COUNTER',
    'STAGE',
    'STAIRS',
    'FIREPLACE',
    'WINDOW',
    'DOOR',
    'WALL',
    'PLANT',
    'PILLAR',
    'RESTROOM',
    'KITCHEN',
    'HOST_STAND',
    'TERRACE_RAILING',
    'SMOKER',
  ]),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(8).max(800),
  height: z.number().int().min(8).max(800),
  rotation: z.number().int().min(-360).max(360).default(0),
  label: z.string().max(40).nullable().optional(),
});

const savePayloadSchema = z.object({
  floorPlanId: z.string().uuid(),
  width: z.number().int().min(200).max(3000),
  height: z.number().int().min(200).max(3000),
  tables: z.array(tableSchema),
  elements: z.array(elementSchema),
});

export type SaveFloorPlanPayload = z.infer<typeof savePayloadSchema>;

export type SaveFloorPlanResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Full-replace save: validate payload, reject if any existing table that has
 * active future reservations is being removed, then delete and recreate
 * tables/elements inside a transaction.
 */
export async function saveFloorPlan(
  input: unknown,
): Promise<SaveFloorPlanResult> {
  const parsed = savePayloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Некорректные данные плана зала' };
  }

  const payload = parsed.data;

  const floorPlan = await prisma.floorPlan.findUnique({
    where: { id: payload.floorPlanId },
    select: { id: true, restaurantId: true },
  });
  if (!floorPlan) {
    return { ok: false, error: 'План зала не найден' };
  }

  // Labels must be unique within the plan
  const labels = payload.tables.map((t) => t.label.trim());
  if (new Set(labels).size !== labels.length) {
    return { ok: false, error: 'У столов в одном плане должны быть уникальные названия' };
  }

  // Check: any currently persisted table that is NOT in the incoming payload
  // AND has active future reservations → refuse.
  const existingTables = await prisma.restaurantTable.findMany({
    where: { floorPlanId: payload.floorPlanId },
    select: { id: true, label: true },
  });
  const incomingIds = new Set(
    payload.tables.map((t) => t.id).filter((id): id is string => typeof id === 'string'),
  );
  const toDelete = existingTables.filter((t) => !incomingIds.has(t.id));
  if (toDelete.length) {
    const now = new Date();
    const blocking = await prisma.reservation.findMany({
      where: {
        tableId: { in: toDelete.map((t) => t.id) },
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        endAt: { gte: now },
      },
      select: { id: true, tableId: true, startAt: true, referenceCode: true },
      take: 5,
    });
    if (blocking.length) {
      const byTable = new Map<string, string>(existingTables.map((t) => [t.id, t.label]));
      const sample = blocking
        .map(
          (r) =>
            `#${r.referenceCode} на столе ${byTable.get(r.tableId) ?? '?'}`,
        )
        .join(', ');
      return {
        ok: false,
        error: `Нельзя удалить столы с активными бронями: ${sample}`,
      };
    }
  }

  // Update floor canvas size + replace all tables/elements atomically.
  await prisma.$transaction(async (tx) => {
    await tx.floorPlan.update({
      where: { id: payload.floorPlanId },
      data: { width: payload.width, height: payload.height },
    });

    // Reservations reference tables by id — recreating would break them.
    // Strategy: upsert by id for tables with an id; create new for ones without.
    // Remove only tables no longer referenced in the payload (already safety-checked).
    if (toDelete.length) {
      await tx.restaurantTable.deleteMany({
        where: { id: { in: toDelete.map((t) => t.id) } },
      });
    }

    for (const t of payload.tables) {
      if (t.id) {
        await tx.restaurantTable.update({
          where: { id: t.id },
          data: {
            label: t.label,
            capacity: t.capacity,
            shape: t.shape,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rotation: t.rotation,
            isActive: t.isActive,
          },
        });
      } else {
        await tx.restaurantTable.create({
          data: {
            restaurantId: floorPlan.restaurantId,
            floorPlanId: payload.floorPlanId,
            label: t.label,
            capacity: t.capacity,
            shape: t.shape,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rotation: t.rotation,
            isActive: t.isActive,
          },
        });
      }
    }

    // Elements have no external references → safe to recreate wholesale.
    await tx.floorPlanElement.deleteMany({
      where: { floorPlanId: payload.floorPlanId },
    });
    for (const e of payload.elements) {
      await tx.floorPlanElement.create({
        data: {
          floorPlanId: payload.floorPlanId,
          type: e.type,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          label: e.label ?? null,
        },
      });
    }
  });

  return { ok: true };
}
