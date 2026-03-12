import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import {
  createReservation,
  listUserReservations,
} from '@/features/reservations/server/reservations.service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await listUserReservations({ userId: user.id });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: validate with Zod schema
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await createReservation({ userId: user.id, ...payload });
  return NextResponse.json(result.body, { status: result.status });
}

