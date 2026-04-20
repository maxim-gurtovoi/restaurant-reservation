-- Role swap + RestaurantManager → RestaurantAdmin rename
-- Semantic change: what used to be MANAGER (restaurant-scoped staff) becomes ADMIN (hall admin);
-- what used to be ADMIN (platform superadmin) becomes MANAGER (restaurant manager, now top role).

-- 1. Atomically swap MANAGER <-> ADMIN in User.role
UPDATE "User"
SET "role" = CASE "role"
  WHEN 'MANAGER' THEN 'ADMIN'::"UserRole"
  WHEN 'ADMIN' THEN 'MANAGER'::"UserRole"
  ELSE "role"
END
WHERE "role" IN ('MANAGER', 'ADMIN');

-- 2. Rename table RestaurantManager -> RestaurantAdmin
ALTER TABLE "RestaurantManager" RENAME TO "RestaurantAdmin";

-- 3. Rename indexes
ALTER INDEX "RestaurantManager_pkey" RENAME TO "RestaurantAdmin_pkey";
ALTER INDEX "RestaurantManager_userId_restaurantId_key" RENAME TO "RestaurantAdmin_userId_restaurantId_key";
ALTER INDEX "RestaurantManager_restaurantId_idx" RENAME TO "RestaurantAdmin_restaurantId_idx";

-- 4. Rename foreign key constraints (to match Prisma's auto-naming on the new model)
ALTER TABLE "RestaurantAdmin" RENAME CONSTRAINT "RestaurantManager_userId_fkey" TO "RestaurantAdmin_userId_fkey";
ALTER TABLE "RestaurantAdmin" RENAME CONSTRAINT "RestaurantManager_restaurantId_fkey" TO "RestaurantAdmin_restaurantId_fkey";
