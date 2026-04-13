import { NextResponse } from 'next/server';

// Legacy route: prefer /api/manager/check-in/[token]

export async function POST() {
  return NextResponse.json(
    { error: 'Для check-in по QR используйте /api/manager/check-in/[token].' },
    { status: 400 },
  );
}

// Legacy check-in route kept for backward compatibility; use /api/manager/check-in/[token] instead.
