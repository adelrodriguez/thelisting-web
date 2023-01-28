-- CreateEnum
CREATE TYPE "RibbonType" AS ENUM ('Banner');

-- AlterTable
ALTER TABLE "Webhook" ALTER COLUMN "payload" SET DATA TYPE JSON;

-- CreateTable
CREATE TABLE "Ribbon" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" UUID NOT NULL,
    "type" "RibbonType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "properties" JSON NOT NULL DEFAULT '{}',

    CONSTRAINT "Ribbon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ribbon" ADD CONSTRAINT "Ribbon_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
