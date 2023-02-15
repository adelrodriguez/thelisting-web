/*
  Warnings:

  - You are about to drop the column `amount` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `cost` to the `ItemPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `ItemPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "ItemPurchase" ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "amount",
ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
