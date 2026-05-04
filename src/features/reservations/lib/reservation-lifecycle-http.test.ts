import { describe, expect, it } from 'vitest';
import { mapReservationLifecycleErrorCodeToHttpStatus } from '@/features/reservations/lib/reservation-lifecycle-http';
import type { ReservationLifecycleErrorCode } from '@/features/reservations/lib/reservation-lifecycle-types';

describe('mapReservationLifecycleErrorCodeToHttpStatus', () => {
  it('maps client errors to 4xx', () => {
    const clientCodes: ReservationLifecycleErrorCode[] = [
      'CANCELLATION_CLOSED',
      'INVALID_STATUS',
      'VALIDATION',
      'TOO_SOON',
      'CHECKIN_TOO_EARLY',
      'CHECKIN_TOO_LATE',
      'NO_SHOW_TOO_EARLY',
    ];
    for (const code of clientCodes) {
      expect(mapReservationLifecycleErrorCodeToHttpStatus(code)).toBe(400);
    }
    expect(mapReservationLifecycleErrorCodeToHttpStatus('NOT_FOUND')).toBe(404);
    expect(mapReservationLifecycleErrorCodeToHttpStatus('FORBIDDEN')).toBe(403);
    expect(mapReservationLifecycleErrorCodeToHttpStatus('CONFLICT')).toBe(409);
  });
});
