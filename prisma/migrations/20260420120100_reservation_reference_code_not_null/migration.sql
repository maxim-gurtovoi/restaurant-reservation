-- Step 2 of 2: enforce NOT NULL + UNIQUE on Reservation.referenceCode.
-- Requires prior run of scripts/backfill-reservation-codes.ts so that no
-- existing rows have NULL referenceCode.
ALTER TABLE "Reservation" ALTER COLUMN "referenceCode" SET NOT NULL;
CREATE UNIQUE INDEX "Reservation_referenceCode_key" ON "Reservation" ("referenceCode");
