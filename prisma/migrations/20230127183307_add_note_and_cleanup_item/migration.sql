/*
  Warnings:

  - You are about to drop the column `available` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Purchase` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('Text', 'Image', 'Audio', 'Video');

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "available",
DROP COLUMN "title",
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "note";

-- CreateTable
CREATE TABLE "Note" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "type" "NoteType" NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_purchaseId_key" ON "Note"("purchaseId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
