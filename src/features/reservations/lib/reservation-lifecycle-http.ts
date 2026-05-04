import type { ReservationLifecycleErrorCode } from '@/features/reservations/lib/reservation-lifecycle-types';

/**
 * Maps domain lifecycle error codes to HTTP status for API routes.
 */
export function mapReservationLifecycleErrorCodeToHttpStatus(
  code: ReservationLifecycleErrorCode,
): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'FORBIDDEN':
      return 403;
    case 'CONFLICT':
      return 409;
    case 'CANCELLATION_CLOSED':
    case 'INVALID_STATUS':
    case 'VALIDATION':
    case 'TOO_SOON':
    case 'CHECKIN_TOO_EARLY':
    case 'CHECKIN_TOO_LATE':
    case 'NO_SHOW_TOO_EARLY':
      return 400;
    default:
      return 400;
  }
}
