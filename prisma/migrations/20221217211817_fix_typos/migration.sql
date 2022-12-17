/*
  Warnings:

  - You are about to drop the column `eventData` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `eventDate` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "eventData",
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "commerceId" DROP NOT NULL;
