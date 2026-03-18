import { NextResponse, type NextRequest } from 'next/server';
import { registerUser } from '@/features/auth/server/auth.service';
import { setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // TODO: validate with Zod schema
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await registerUser(payload);
  const response = NextResponse.json(result.body, { status: result.status });

  if (result.status === 201 && typeof result.body?.token === 'string') {
    setAuthCookie(response, result.body.token);
  }

  return response;
}

