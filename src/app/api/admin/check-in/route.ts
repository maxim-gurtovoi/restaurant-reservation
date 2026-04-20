import { NextResponse } from 'next/server';

// Legacy route: prefer /api/admin/check-in/[token]

export async function POST() {
  return NextResponse.json(
    { error: 'Для check-in по QR используйте /api/admin/check-in/[token].' },
    { status: 400 },
  );
}
