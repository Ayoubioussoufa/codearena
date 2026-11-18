-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Verdict" ADD VALUE 'JUDGING';
ALTER TYPE "Verdict" ADD VALUE 'SYSTEM_ERROR';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedBy" TEXT;
