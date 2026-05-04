/** Length of the reserved table window; used by server parsing and client slot grid. */
export const RESERVATION_DURATION_MINUTES = 90;

/** Minimum delay before reservation start to avoid immediate/retroactive bookings. */
export const BOOKING_LEAD_MINUTES = 20;

/** Allowed check-in slack around scheduled slot. */
export const CHECKIN_EARLY_GRACE_MINUTES = 30;
export const CHECKIN_LATE_GRACE_MINUTES = 30;
