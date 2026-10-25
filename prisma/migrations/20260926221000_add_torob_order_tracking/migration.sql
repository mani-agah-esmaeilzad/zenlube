ALTER TABLE "Order"
ADD COLUMN "torobClid" TEXT;

CREATE INDEX "Order_torobClid_createdAt_idx"
ON "Order"("torobClid", "createdAt");

CREATE TABLE "TorobOrderTrackingSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TorobOrderTrackingSettings_pkey" PRIMARY KEY ("id")
);
