-- Ensure optional payment columns exist on Order table
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "paymentAuthority" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentRefId" TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "shippingTrackingCode" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);

-- Ensure shippingCost column exists with the correct numeric type and default
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "shippingCost" DECIMAL(10, 2) NOT NULL DEFAULT 0;
