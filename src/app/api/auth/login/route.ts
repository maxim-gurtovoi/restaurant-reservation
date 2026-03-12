import { NextResponse, type NextRequest } from 'next/server';
import { setAuthCookie } from '@/lib/auth';
import { loginUser } from '@/features/auth/server/auth.service';

export async function POST(req: NextRequest) {
  // TODO: validate with Zod schema
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await loginUser(payload);
  const response = NextResponse.json(result.body, { status: result.status });

  if (result.status === 200 && 'token' in result.body) {
    setAuthCookie(response, result.body.token);
  }

  return response;
}

