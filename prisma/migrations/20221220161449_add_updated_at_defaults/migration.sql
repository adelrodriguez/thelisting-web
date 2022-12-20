/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_path_key" ON "Listing"("path");
