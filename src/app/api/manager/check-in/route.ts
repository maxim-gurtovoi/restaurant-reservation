import { NextResponse } from 'next/server';

// Legacy route: prefer /api/manager/check-in/[token]

export async function POST() {
  return NextResponse.json(
    { error: 'Use /api/manager/check-in/[token] for QR check-in.' },
    { status: 400 },
  );
}

// Legacy check-in route kept for backward compatibility; use /api/manager/check-in/[token] instead.
