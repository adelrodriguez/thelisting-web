/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Webhook` table. All the data in the column will be lost.
  - Added the required column `webhookId` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "serviceId",
ADD COLUMN     "webhookId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commerceId" VARCHAR(255),
    "listingId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPurchase" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ItemPurchase_pkey" PRIMARY KEY ("itemId","purchaseId")
);

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
