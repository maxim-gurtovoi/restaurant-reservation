-- CreateTable
CREATE TABLE "FavoriteRestaurant" (
    "userId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteRestaurant_pkey" PRIMARY KEY ("userId","restaurantId")
);

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "minBookingLeadMinutes" INTEGER,
ADD COLUMN     "maxGuestsWithoutPhone" INTEGER,
ADD COLUMN     "blockedRecurrenceJson" JSONB;

-- AddForeignKey
ALTER TABLE "FavoriteRestaurant" ADD CONSTRAINT "FavoriteRestaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteRestaurant" ADD CONSTRAINT "FavoriteRestaurant_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "FavoriteRestaurant_restaurantId_idx" ON "FavoriteRestaurant"("restaurantId");
