-- Add paymentGateway column to Order if it does not exist yet
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentGateway" "PaymentGateway" NOT NULL DEFAULT 'ZARINPAL';

-- Add paymentMethod column if needed (used alongside paymentGateway in schema)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'ONLINE';
