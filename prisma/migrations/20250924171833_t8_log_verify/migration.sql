/*
  Warnings:

  - The `status` column on the `Verification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_verifierId_fkey";

-- DropIndex
DROP INDEX "LogEntry_internId_idx";

-- DropIndex
DROP INDEX "Verification_verifierId_idx";

-- AlterTable
ALTER TABLE "Verification" ALTER COLUMN "verifierId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "timestamp" DROP NOT NULL,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "LogEntry_internId_date_idx" ON "LogEntry"("internId", "date");

-- CreateIndex
CREATE INDEX "Verification_status_idx" ON "Verification"("status");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
