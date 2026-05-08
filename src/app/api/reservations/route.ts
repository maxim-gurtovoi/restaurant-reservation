import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/server/auth';
import {
  createReservation,
  listUserReservations,
} from '@/features/reservations/server/reservations.service';

const createReservationSchema = z.object({
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guestCount: z.number().int().min(1).max(20),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10).max(24).optional(),
  contactEmail: z.string().email().optional(),
});

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

  const parsed = createReservationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid reservation payload', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await createReservation({
    userId: user.id,
    restaurantId: parsed.data.restaurantId,
    tableId: parsed.data.tableId,
    date: parsed.data.date,
    time: parsed.data.time,
    guestCount: parsed.data.guestCount,
    contactName: parsed.data.contactName,
    contactPhone: parsed.data.contactPhone,
    contactEmail: parsed.data.contactEmail,
  });
  return NextResponse.json(result.body, { status: result.status });
}

