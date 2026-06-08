-- CreateEnum
CREATE TYPE "BusinessRole" AS ENUM ('OWNER', 'STAFF');

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_users" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "BusinessRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_users_pkey" PRIMARY KEY ("id")
);

-- Add businessId to appointments (nullable during migration)
ALTER TABLE "appointments" ADD COLUMN "businessId" UUID;

-- Create one default business per user who already has appointments
INSERT INTO "businesses" ("id", "name", "ownerId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), u."name" || ' Business', u."id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
WHERE EXISTS (
  SELECT 1 FROM "appointments" a WHERE a."userId" = u."id"
);

-- Link owners as BusinessUser with OWNER role
INSERT INTO "business_users" ("id", "businessId", "userId", "role", "createdAt", "updatedAt")
SELECT gen_random_uuid(), b."id", b."ownerId", 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "businesses" b;

-- Assign existing appointments to the owner's default business
UPDATE "appointments" a
SET "businessId" = b."id"
FROM "businesses" b
WHERE b."ownerId" = a."userId";

-- Remove legacy user scoping from appointments
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";
DROP INDEX IF EXISTS "appointments_userId_idx";
ALTER TABLE "appointments" DROP COLUMN "userId";

-- businessId is required for all appointments going forward
ALTER TABLE "appointments" ALTER COLUMN "businessId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "businesses_ownerId_idx" ON "businesses"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "business_users_businessId_userId_key" ON "business_users"("businessId", "userId");

-- CreateIndex
CREATE INDEX "business_users_userId_idx" ON "business_users"("userId");

-- CreateIndex
CREATE INDEX "business_users_businessId_idx" ON "business_users"("businessId");

-- CreateIndex
CREATE INDEX "appointments_businessId_idx" ON "appointments"("businessId");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_users" ADD CONSTRAINT "business_users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_users" ADD CONSTRAINT "business_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
