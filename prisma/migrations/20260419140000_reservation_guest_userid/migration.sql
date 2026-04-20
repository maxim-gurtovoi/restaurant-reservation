-- AlterTable: allow guest reservations without linked user
ALTER TABLE "Reservation" ALTER COLUMN "userId" DROP NOT NULL;
