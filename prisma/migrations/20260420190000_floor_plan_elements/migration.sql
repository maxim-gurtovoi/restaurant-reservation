-- CreateEnum
CREATE TYPE "FloorPlanElementType" AS ENUM (
  'BAR_COUNTER',
  'STAGE',
  'STAIRS',
  'FIREPLACE',
  'WINDOW',
  'DOOR',
  'WALL',
  'PLANT',
  'PILLAR',
  'RESTROOM',
  'KITCHEN',
  'HOST_STAND',
  'TERRACE_RAILING',
  'SMOKER'
);

-- CreateTable
CREATE TABLE "FloorPlanElement" (
  "id" UUID NOT NULL,
  "floorPlanId" UUID NOT NULL,
  "type" "FloorPlanElementType" NOT NULL,
  "x" INTEGER NOT NULL,
  "y" INTEGER NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "rotation" INTEGER NOT NULL DEFAULT 0,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FloorPlanElement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FloorPlanElement_floorPlanId_idx" ON "FloorPlanElement"("floorPlanId");

-- AddForeignKey
ALTER TABLE "FloorPlanElement" ADD CONSTRAINT "FloorPlanElement_floorPlanId_fkey"
  FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
