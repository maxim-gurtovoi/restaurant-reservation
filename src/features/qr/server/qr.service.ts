import 'server-only';

// TODO: integrate a QR library to generate/verify QR payloads
export function generateReservationQr(reservationId: string): string {
  return `qr:${reservationId}`;
}

