import 'server-only';

import { NextResponse } from 'next/server';
import type { JwtPayloadUser } from '@/types/auth';
import { getCurrentUser } from '@/server/auth';

export type ManagerApiAuth =
  | { ok: true; user: JwtPayloadUser }
  | { ok: false; response: NextResponse };

/**
 * For /api/manager/* routes: authenticated user must be MANAGER or ADMIN (same as middleware).
 * Restaurant-scoped authorization still lives in services.
 */
export async function requireManagerApi(): Promise<ManagerApiAuth> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 }),
    };
  }
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Нет доступа' }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
