/*
  Warnings:

  - Added the required column `ownerId` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('Wedding', 'Birthday', 'Baby Shower', 'Other');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "ownerId" UUID NOT NULL,
ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'Wedding';

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
