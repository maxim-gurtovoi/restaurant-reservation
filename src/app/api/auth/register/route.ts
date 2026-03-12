import { NextResponse, type NextRequest } from 'next/server';
import { registerUser } from '@/features/auth/server/auth.service';

export async function POST(req: NextRequest) {
  // TODO: validate with Zod schema
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await registerUser(payload);
  return NextResponse.json(result.body, { status: result.status });
}

