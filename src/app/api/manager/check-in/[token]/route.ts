import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import {
  confirmCheckInByQrToken,
  getReservationByQrTokenForManager,
} from '@/features/manager/server/check-in.service';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const manager = await getCurrentUser();
  if (!manager) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await ctx.params;
  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

  try {
    const reservation = await getReservationByQrTokenForManager({
      managerUserId: manager.id,
      qrToken: token,
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: reservation.id,
        status: reservation.status,
        guestCount: reservation.guestCount,
        startAt: reservation.startAt.toISOString(),
        endAt: reservation.endAt.toISOString(),
        qrToken: reservation.qrToken,
        contactName: reservation.contactName,
        restaurant: reservation.restaurant,
        table: reservation.table,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load reservation';
    const status = message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const manager = await getCurrentUser();
  if (!manager) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await ctx.params;
  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

  try {
    const result = await confirmCheckInByQrToken({
      managerUserId: manager.id,
      qrToken: token,
    });

    return NextResponse.json(
      {
        reservationId: result.reservationId,
        status: result.status,
        checkedInAt: result.checkedInAt.toISOString(),
        method: result.method,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check in reservation';
    const status =
      message === 'Reservation not found' ? 404 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

