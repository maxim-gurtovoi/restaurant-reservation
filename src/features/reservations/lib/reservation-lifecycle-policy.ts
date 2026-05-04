/**
 * Pure lifecycle rules for reservations (testable, no I/O).
 */

export function getCheckInTimeWindowViolation(
  now: Date,
  startAt: Date,
  endAt: Date,
  earlyGraceMinutes: number,
  lateGraceMinutes: number,
): 'too_early' | 'too_late' | null {
  const earliestCheckInAt = new Date(startAt.getTime() - earlyGraceMinutes * 60 * 1000);
  const latestCheckInAt = new Date(endAt.getTime() + lateGraceMinutes * 60 * 1000);
  if (now < earliestCheckInAt) return 'too_early';
  if (now > latestCheckInAt) return 'too_late';
  return null;
}

/** Guest may cancel only before the scheduled start instant. */
export function canGuestCancelConfirmedReservation(startAt: Date, now: Date): boolean {
  return startAt.getTime() > now.getTime();
}

/** No-show is meaningful only after the reserved slot has ended. */
export function canMarkNoShowAfterSlotEnd(endAt: Date, now: Date): boolean {
  return endAt.getTime() <= now.getTime();
}

/** Creation: start must not be before the computed minimum bookable instant (UTC). */
export function isReservationStartBeforeMinBookable(startAt: Date, minBookableUtc: Date): boolean {
  return startAt.getTime() < minBookableUtc.getTime();
}
