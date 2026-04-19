import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import {
  createReservation,
  listUserReservations,
} from '@/features/reservations/server/reservations.service';
import { prisma } from '@/lib/prisma';
import { isValidBookingPhone, normalizePhoneDigits } from '@/lib/guest-contact';

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

  let contactName = typeof payload.contactName === 'string' ? payload.contactName.trim() : '';
  let contactPhone = typeof payload.contactPhone === 'string' ? payload.contactPhone.trim() : '';
  const contactEmail =
    typeof payload.contactEmail === 'string' && payload.contactEmail.trim().length > 0
      ? payload.contactEmail.trim()
      : undefined;

  if (user) {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, phone: true },
    });
    if (!contactName && profile?.name) {
      contactName = profile.name.trim();
    }
    const profilePhoneDigits = profile?.phone ? normalizePhoneDigits(profile.phone) : '';
    if (!contactPhone && profilePhoneDigits) {
      contactPhone = profilePhoneDigits;
    }
  } else {
    if (!contactName || contactName.length < 2) {
      return NextResponse.json({ error: 'Укажите имя' }, { status: 400 });
    }
    if (!contactPhone || !isValidBookingPhone(contactPhone)) {
      return NextResponse.json({ error: 'Укажите корректный номер телефона' }, { status: 400 });
    }
  }

  if (!contactName || contactName.length < 2) {
    return NextResponse.json({ error: 'Укажите имя' }, { status: 400 });
  }
  if (!contactPhone || !isValidBookingPhone(contactPhone)) {
    return NextResponse.json(
      {
        error: user
          ? 'Укажите телефон для брони или добавьте его в профиль'
          : 'Укажите корректный номер телефона',
      },
      { status: 400 },
    );
  }

  const result = await createReservation({
    userId: user?.id ?? null,
    restaurantId: payload.restaurantId,
    tableId: payload.tableId,
    date: payload.date,
    time: payload.time,
    guestCount: payload.guestCount,
    contactName,
    contactPhone,
    contactEmail,
  });
  return NextResponse.json(result.body, { status: result.status });
}

