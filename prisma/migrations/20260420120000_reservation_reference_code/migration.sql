-- Step 1 of 2: add nullable referenceCode to Reservation.
-- Run scripts/backfill-reservation-codes.ts after this migration,
-- then apply migration 20260420120100_reservation_reference_code_not_null
-- to enforce NOT NULL + UNIQUE.
ALTER TABLE "Reservation" ADD COLUMN "referenceCode" TEXT;
