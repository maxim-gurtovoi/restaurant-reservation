import 'server-only';

/**
 * Full URL opened by the manager after scanning the guest’s QR (contains opaque `qrToken`).
 */
export function buildManagerCheckInUrl(input: { baseUrl: string; qrToken: string }): string {
  const base = input.baseUrl.replace(/\/+$/, '');
  return `${base}/manager/check-in/${encodeURIComponent(input.qrToken)}`;
}

/** Opaque payload for future QR formats (not used for manager scan URL today). */
export function buildReservationQrPayload(reservationId: string): string {
  return `reservation:${reservationId}`;
}
