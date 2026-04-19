import { NextResponse, type NextRequest } from 'next/server';
import { getAvailability } from '@/features/reservations/server/reservations.service';
import { rateLimitOr429 } from '@/lib/simple-rate-limit';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const limited = rateLimitOr429(`availability:${ip}`, 120, 60_000);
  if (limited) return limited;

  const restaurantId = req.nextUrl.searchParams.get('restaurantId') ?? '';
  const date = req.nextUrl.searchParams.get('date') ?? '';
  const time = req.nextUrl.searchParams.get('time') ?? '';

  if (!restaurantId) {
    return NextResponse.json({ error: 'Укажите restaurantId' }, { status: 400 });
  }
  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: 'Укажите дату (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!time || !isValidTime(time)) {
    return NextResponse.json({ error: 'Укажите время (ЧЧ:мм)' }, { status: 400 });
  }

  const result = await getAvailability({ restaurantId, date, time });
  const res = NextResponse.json(result.body, { status: result.status });
  if (result.status === 200) {
    res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
  }
  return res;
}
