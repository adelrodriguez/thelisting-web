-- CreateTable
CREATE TABLE "Checkout" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commerceId" VARCHAR(255),
    "completedAt" TIMESTAMP(3),
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_commerceId_key" ON "Checkout"("commerceId");
