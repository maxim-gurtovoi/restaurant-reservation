import { NextResponse, type NextRequest } from 'next/server';
import { listRestaurants } from '@/features/restaurants/server/restaurants.service';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? undefined;
  const result = await listRestaurants({ city });
  return NextResponse.json(result.body, { status: result.status });
}

