export type ReservationLifecycleErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_STATUS'
  | 'TOO_SOON'
  | 'CANCELLATION_CLOSED'
  | 'CHECKIN_TOO_EARLY'
  | 'CHECKIN_TOO_LATE'
  | 'NO_SHOW_TOO_EARLY'
  | 'CONFLICT'
  | 'VALIDATION';

export class ReservationLifecycleError extends Error {
  readonly code: ReservationLifecycleErrorCode;

  constructor(code: ReservationLifecycleErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ReservationLifecycleError';
  }
}
