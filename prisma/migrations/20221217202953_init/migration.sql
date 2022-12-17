-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('Draft', 'Published', 'Closed');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "commerceId" VARCHAR(255) NOT NULL,
    "eventData" TIMESTAMP(3) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL DEFAULT 'Draft',
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
