/*
  Warnings:

  - You are about to drop the column `accessCode` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "accessCode",
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE INDEX "sessions_createdById_idx" ON "sessions"("createdById");
