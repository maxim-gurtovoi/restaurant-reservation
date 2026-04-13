import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import {
  createReservation,
  listUserReservations,
} from '@/features/reservations/server/reservations.service';

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });

  const result = await listUserReservations({ userId: user.id });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Некорректное тело запроса (JSON)' }, { status: 400 });
  }

  if (typeof payload.restaurantId !== 'string' || !payload.restaurantId) {
    return NextResponse.json({ error: 'Укажите restaurantId' }, { status: 400 });
  }
  if (typeof payload.tableId !== 'string' || !payload.tableId) {
    return NextResponse.json({ error: 'Укажите tableId' }, { status: 400 });
  }
  if (!isValidDate(payload.date)) {
    return NextResponse.json({ error: 'Укажите дату (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!isValidTime(payload.time)) {
    return NextResponse.json({ error: 'Укажите время (ЧЧ:мм)' }, { status: 400 });
  }
  if (typeof payload.guestCount !== 'number' || !Number.isFinite(payload.guestCount) || payload.guestCount < 1) {
    return NextResponse.json({ error: 'guestCount должно быть числом ≥ 1' }, { status: 400 });
  }

  const result = await createReservation({
    userId: user.id,
    restaurantId: payload.restaurantId,
    tableId: payload.tableId,
    date: payload.date,
    time: payload.time,
    guestCount: payload.guestCount,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    contactEmail: payload.contactEmail,
  });
  return NextResponse.json(result.body, { status: result.status });
}

