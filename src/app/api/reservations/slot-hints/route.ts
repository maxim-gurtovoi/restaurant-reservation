import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotOccupancyHints } from '@/features/reservations/server/slot-occupancy-hints';
import { rateLimitOr429 } from '@/lib/simple-rate-limit';

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const limited = rateLimitOr429(`slot-hints:${ip}`, 90, 60_000);
  if (limited) return limited;

  const restaurantId = req.nextUrl.searchParams.get('restaurantId') ?? '';
  const date = req.nextUrl.searchParams.get('date') ?? '';

  if (!restaurantId) {
    return NextResponse.json({ error: 'Укажите restaurantId' }, { status: 400 });
  }
  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: 'Укажите дату (YYYY-MM-DD)' }, { status: 400 });
  }

  const workingHours = await prisma.workingHours.findMany({
    where: { restaurantId },
    select: {
      dayOfWeek: true,
      openTime: true,
      closeTime: true,
      isClosed: true,
    },
  });

  const payload = await getSlotOccupancyHints({
    restaurantId,
    date,
    workingHours,
  });

  const res = NextResponse.json(payload, { status: 200 });
  res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
  return res;
}
