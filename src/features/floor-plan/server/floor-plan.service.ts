import 'server-only';
import { prisma } from '@/lib/prisma';

// TODO: implement floor plan read/write (tables, positions, zones)
export async function getFloorPlan(input: { restaurantId: string }) {
  void input;
  void prisma;
  return null;
}

