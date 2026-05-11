import { NextResponse, type NextRequest } from 'next/server';
import { suggestRestaurants } from '@/features/restaurants/server/restaurants.service';

const MAX_Q = 120;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length > MAX_Q) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const parsed = limitRaw ? parseInt(limitRaw, 10) : 8;
  const limit = Number.isFinite(parsed) ? parsed : 8;
  const items = await suggestRestaurants({ q, limit });
  return NextResponse.json({ items });
}
