-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_purchaseId_fkey";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "purchaseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
