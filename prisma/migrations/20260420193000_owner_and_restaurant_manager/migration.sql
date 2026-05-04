-- UserRole.OWNER + Restaurant.managerUserId (one manager per restaurant)

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OWNER';

ALTER TABLE "Restaurant" ADD COLUMN "managerUserId" UUID;

CREATE UNIQUE INDEX "Restaurant_managerUserId_key" ON "Restaurant"("managerUserId");

ALTER TABLE "Restaurant"
  ADD CONSTRAINT "Restaurant_managerUserId_fkey"
  FOREIGN KEY ("managerUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
