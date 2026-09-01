-- CreateEnum
CREATE TYPE "PromotionKind" AS ENUM ('SALE', 'OCTANE', 'RACING_FUEL');

-- CreateTable
CREATE TABLE "ProductPromotion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" "PromotionKind" NOT NULL DEFAULT 'SALE',
    "label" TEXT,
    "specialPrice" DECIMAL(10,2),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPromotion_productId_key" ON "ProductPromotion"("productId");

-- CreateIndex
CREATE INDEX "ProductPromotion_isActive_sortOrder_idx" ON "ProductPromotion"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductPromotion_kind_isActive_idx" ON "ProductPromotion"("kind", "isActive");

-- CreateIndex
CREATE INDEX "ProductPromotion_startsAt_endsAt_idx" ON "ProductPromotion"("startsAt", "endsAt");

-- AddForeignKey
ALTER TABLE "ProductPromotion" ADD CONSTRAINT "ProductPromotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
