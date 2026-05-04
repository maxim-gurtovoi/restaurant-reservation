import { describe, expect, it } from 'vitest';
import {
  canGuestCancelConfirmedReservation,
  canMarkNoShowAfterSlotEnd,
  getCheckInTimeWindowViolation,
  isReservationStartBeforeMinBookable,
} from '@/features/reservations/lib/reservation-lifecycle-policy';

describe('getCheckInTimeWindowViolation', () => {
  const startAt = new Date('2026-05-04T18:00:00.000Z');
  const endAt = new Date('2026-05-04T19:30:00.000Z');
  const early = 30;
  const late = 30;

  it('returns too_early before grace window', () => {
    const now = new Date('2026-05-04T17:29:00.000Z');
    expect(getCheckInTimeWindowViolation(now, startAt, endAt, early, late)).toBe('too_early');
  });

  it('returns null inside window', () => {
    const now = new Date('2026-05-04T18:00:00.000Z');
    expect(getCheckInTimeWindowViolation(now, startAt, endAt, early, late)).toBeNull();
  });

  it('returns too_late after end + grace', () => {
    const now = new Date('2026-05-04T20:01:00.000Z');
    expect(getCheckInTimeWindowViolation(now, startAt, endAt, early, late)).toBe('too_late');
  });
});

describe('canGuestCancelConfirmedReservation', () => {
  it('allows cancel when start is in the future', () => {
    const startAt = new Date('2026-05-04T20:00:00.000Z');
    const now = new Date('2026-05-04T19:00:00.000Z');
    expect(canGuestCancelConfirmedReservation(startAt, now)).toBe(true);
  });

  it('disallows cancel at or after start', () => {
    const startAt = new Date('2026-05-04T20:00:00.000Z');
    expect(canGuestCancelConfirmedReservation(startAt, startAt)).toBe(false);
    expect(canGuestCancelConfirmedReservation(startAt, new Date('2026-05-04T20:01:00.000Z'))).toBe(
      false,
    );
  });
});

describe('canMarkNoShowAfterSlotEnd', () => {
  it('allows only when endAt <= now', () => {
    const endAt = new Date('2026-05-04T19:30:00.000Z');
    expect(canMarkNoShowAfterSlotEnd(endAt, endAt)).toBe(true);
    expect(canMarkNoShowAfterSlotEnd(endAt, new Date('2026-05-04T19:31:00.000Z'))).toBe(true);
    expect(canMarkNoShowAfterSlotEnd(endAt, new Date('2026-05-04T19:29:00.000Z'))).toBe(false);
  });
});

describe('isReservationStartBeforeMinBookable', () => {
  it('compares instants in UTC', () => {
    const startAt = new Date('2026-05-04T12:00:00.000Z');
    const min = new Date('2026-05-04T12:30:00.000Z');
    expect(isReservationStartBeforeMinBookable(startAt, min)).toBe(true);
    expect(isReservationStartBeforeMinBookable(min, startAt)).toBe(false);
  });
});
