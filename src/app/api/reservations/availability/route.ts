import { NextResponse, type NextRequest } from 'next/server';
import { getAvailability } from '@/features/reservations/server/reservations.service';

export async function GET(req: NextRequest) {
  // TODO: validate query with Zod schema
  const restaurantId = req.nextUrl.searchParams.get('restaurantId') ?? '';
  const date = req.nextUrl.searchParams.get('date') ?? '';
  const time = req.nextUrl.searchParams.get('time') ?? '';

  const result = await getAvailability({ restaurantId, date, time });
  return NextResponse.json(result.body, { status: result.status });
}
