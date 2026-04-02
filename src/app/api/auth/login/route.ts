import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { setAuthCookie } from '@/lib/auth';
import { loginUser } from '@/features/auth/server/auth.service';

const loginPayloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const parsed = loginPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await loginUser(parsed.data);
  const response = NextResponse.json(result.body, { status: result.status });

  if (result.status === 200 && 'token' in result.body) {
    setAuthCookie(response, result.body.token);
  }

  return response;
}

