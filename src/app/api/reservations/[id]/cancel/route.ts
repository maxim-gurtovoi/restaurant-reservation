import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import { cancelReservation } from '@/features/reservations/server/cancel-reservation';
import { mapReservationLifecycleErrorCodeToHttpStatus } from '@/features/reservations/lib/reservation-lifecycle-http';
import { ReservationLifecycleError } from '@/features/reservations/server/reservation-lifecycle-error';

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });

  const { id: reservationId } = await ctx.params;
  if (!reservationId) {
    return NextResponse.json({ error: 'Укажите идентификатор брони' }, { status: 400 });
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
    if (error instanceof ReservationLifecycleError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: mapReservationLifecycleErrorCodeToHttpStatus(error.code) },
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to cancel reservation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

