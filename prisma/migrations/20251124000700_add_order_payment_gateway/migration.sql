-- Ensure PaymentGateway enum exists
DO $$
BEGIN
  CREATE TYPE "PaymentGateway" AS ENUM ('ZARINPAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure PaymentMethod enum exists
DO $$
BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'ONLINE', 'BANK_TRANSFER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add paymentGateway column to Order if it does not exist yet
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentGateway" "PaymentGateway" NOT NULL DEFAULT 'ZARINPAL';

-- Add paymentMethod column if needed (used alongside paymentGateway in schema)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ONLINE';
