/** Digits only for storage and comparison. */
export function normalizePhoneDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/** E.164-friendly length (10–15 digits after normalization). */
export function isValidBookingPhone(input: string): boolean {
  const d = normalizePhoneDigits(input);
  return d.length >= 10 && d.length <= 15;
}
