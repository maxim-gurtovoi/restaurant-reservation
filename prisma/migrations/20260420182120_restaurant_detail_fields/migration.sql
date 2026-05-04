-- CreateEnum
CREATE TYPE "RestaurantFeature" AS ENUM ('CARD_PAYMENT', 'DELIVERY', 'TAKEAWAY', 'TERRACE', 'LIVE_MUSIC', 'PARKING', 'WIFI', 'PET_FRIENDLY', 'FAMILY_FRIENDLY', 'RESERVATIONS');

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "cuisine" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "features" "RestaurantFeature"[],
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "priceLevel" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "websiteUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
