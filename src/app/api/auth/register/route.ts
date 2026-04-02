import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/features/auth/server/auth.service';
import { setAuthCookie } from '@/lib/auth';

const registerPayloadSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const parsed = registerPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await registerUser(parsed.data);
  const response = NextResponse.json(result.body, { status: result.status });

  if (result.status === 201 && 'token' in result.body) {
    setAuthCookie(response, result.body.token);
  }

  return response;
}

