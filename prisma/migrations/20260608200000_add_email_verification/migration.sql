-- AlterTable
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT true;

-- New registrations will explicitly set emailVerified = false
ALTER TABLE "users" ALTER COLUMN "emailVerified" SET DEFAULT false;
