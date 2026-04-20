import 'server-only';

import { NextResponse } from 'next/server';
import type { JwtPayloadUser } from '@/types/auth';
import { getCurrentUser } from '@/server/auth';

export type AdminApiAuth =
  | { ok: true; user: JwtPayloadUser }
  | { ok: false; response: NextResponse };

/**
 * For `/api/admin/*` routes: authenticated user must be ADMIN or MANAGER (same as middleware).
 * Restaurant-scoped authorization still lives in services.
 */
export async function requireAdminApi(): Promise<AdminApiAuth> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 }),
    };
  }
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Нет доступа' }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
