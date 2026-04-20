import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminApi } from '@/server/require-admin-api';
import {
  applyAdminReservationAction,
  type AdminReservationAction,
} from '@/features/admin/server/admin-reservation-actions.service';

const ACTIONS: AdminReservationAction[] = ['check_in', 'complete', 'cancel', 'no_show'];

function parseAction(body: unknown): AdminReservationAction | null {
  if (!body || typeof body !== 'object') return null;
  const action = (body as { action?: unknown }).action;
  if (typeof action !== 'string') return null;
  return ACTIONS.includes(action as AdminReservationAction)
    ? (action as AdminReservationAction)
    : null;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const admin = auth.user;

  const { id: reservationId } = await ctx.params;
  if (!reservationId) {
    return NextResponse.json({ error: 'Укажите идентификатор брони' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некорректное тело запроса (JSON)' }, { status: 400 });
  }

  const action = parseAction(body);
  if (!action) {
    return NextResponse.json(
      { error: 'Недопустимое действие. Ожидается: check_in, complete, cancel, no_show.' },
      { status: 400 },
    );
  }

  try {
    const result = await applyAdminReservationAction({
      reservationId,
      adminUserId: admin.id,
      action,
    });
    return NextResponse.json({ status: result.status }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось обновить бронь';
    const status =
      message === 'Бронь не найдена' ? 404 : message.startsWith('Нельзя') ? 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
