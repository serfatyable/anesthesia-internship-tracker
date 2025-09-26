-- AlterTable
ALTER TABLE "User" ADD COLUMN "idNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");

-- AlterTable
ALTER TABLE "Rotation" ADD COLUMN "state" TEXT DEFAULT 'NOT_STARTED';
