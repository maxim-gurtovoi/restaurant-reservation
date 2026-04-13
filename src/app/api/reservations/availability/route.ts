import { NextResponse, type NextRequest } from 'next/server';
import { getAvailability } from '@/features/reservations/server/reservations.service';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
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
  return NextResponse.json(result.body, { status: result.status });
}
