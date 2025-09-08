/*
  Warnings:

  - A unique constraint covering the columns `[phoneVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneVerificationToken" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneVerificationToken_key" ON "users"("phoneVerificationToken");
