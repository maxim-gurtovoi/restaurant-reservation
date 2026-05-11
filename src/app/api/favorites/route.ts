import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/server/auth';
import {
  addFavorite,
  listFavoriteRestaurantsForUser,
  removeFavorite,
} from '@/features/favorites/server/favorites.service';

const bodySchema = z.object({
  restaurantId: z.string().uuid(),
});

/** Current user's favorites (for listing page). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await listFavoriteRestaurantsForUser(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const result = await addFavorite({
    userId: user.id,
    restaurantId: parsed.data.restaurantId,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const restaurantId = req.nextUrl.searchParams.get('restaurantId') ?? '';
  const parsed = z.string().uuid().safeParse(restaurantId);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Укажите restaurantId' }, { status: 400 });
  }

  await removeFavorite({ userId: user.id, restaurantId: parsed.data });
  return NextResponse.json({ ok: true });
}
