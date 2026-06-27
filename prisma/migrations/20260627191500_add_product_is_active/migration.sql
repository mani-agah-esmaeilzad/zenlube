-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
