/**
 * Allow only same-app relative paths after login (blocks protocol-relative and absolute URLs).
 */
export function sanitizeInternalNextPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  if (t.includes('://')) return null;
  return t;
}
