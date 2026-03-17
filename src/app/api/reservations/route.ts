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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await listUserReservations({ userId: user.id });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof payload.restaurantId !== 'string' || !payload.restaurantId) {
    return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 });
  }
  if (typeof payload.tableId !== 'string' || !payload.tableId) {
    return NextResponse.json({ error: 'tableId is required' }, { status: 400 });
  }
  if (!isValidDate(payload.date)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!isValidTime(payload.time)) {
    return NextResponse.json({ error: 'time is required (HH:mm)' }, { status: 400 });
  }
  if (typeof payload.guestCount !== 'number' || !Number.isFinite(payload.guestCount) || payload.guestCount < 1) {
    return NextResponse.json({ error: 'guestCount must be a number >= 1' }, { status: 400 });
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

