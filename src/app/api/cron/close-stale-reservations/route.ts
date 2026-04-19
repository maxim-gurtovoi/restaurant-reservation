import { NextResponse, type NextRequest } from 'next/server';
import { applyStaleReservationTransitions } from '@/features/reservations/server/stale-reservation-policy';

function authorize(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const header = req.headers.get('x-cron-secret');
  if (header === expected) return true;
  const q = req.nextUrl.searchParams.get('secret');
  return q === expected;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await applyStaleReservationTransitions();
  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
