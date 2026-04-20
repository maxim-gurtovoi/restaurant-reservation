import 'server-only';

/**
 * Full URL opened by the hall admin after scanning the guest's QR (contains opaque `qrToken`).
 */
export function buildAdminCheckInUrl(input: { baseUrl: string; qrToken: string }): string {
  const base = input.baseUrl.replace(/\/+$/, '');
  return `${base}/admin/check-in/${encodeURIComponent(input.qrToken)}`;
}

/** Opaque payload for future QR formats (not used for admin scan URL today). */
export function buildReservationQrPayload(reservationId: string): string {
  return `reservation:${reservationId}`;
}
