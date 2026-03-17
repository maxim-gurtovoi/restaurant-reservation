import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import { cancelReservation } from '@/features/reservations/server/cancel-reservation';

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: reservationId } = await ctx.params;
  if (!reservationId) {
    return NextResponse.json({ error: 'Reservation id is required' }, { status: 400 });
  }

  try {
    const result = await cancelReservation({ reservationId, userId: user.id });
    return NextResponse.json(
      {
        id: result.id,
        status: result.status,
        cancelledAt: result.cancelledAt.toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel reservation';
    const status = message === 'Reservation not found' ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

