/**
 * Human-readable reservation reference code utilities.
 *
 * Storage format: 7 consecutive digits (e.g. "1234567").
 * Display format: "XXX-XXXX" (e.g. "123-4567") for readability when spoken
 * or read from a screen. Storage stays without separator so a UNIQUE index
 * is simple and lookups are normalized.
 */

export const REFERENCE_CODE_LENGTH = 7;

const DIGITS_ONLY_RE = /\D+/g;
const STORAGE_RE = /^\d{7}$/;

/** "1234567" -> "123-4567". Returns input unchanged if not canonical 7 digits. */
export function formatReferenceCode(code: string): string {
  if (!STORAGE_RE.test(code)) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** Accepts "123-4567", "123 4567", "1234567" and returns "1234567". */
export function normalizeReferenceCodeQuery(input: string): string {
  return input.replace(DIGITS_ONLY_RE, '');
}

/** Returns true when `value` is a canonical 7-digit storage form. */
export function isCanonicalReferenceCode(value: string): boolean {
  return STORAGE_RE.test(value);
}
