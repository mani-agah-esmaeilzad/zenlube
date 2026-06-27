CREATE TABLE IF NOT EXISTS "OtpRequest" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'checkout',
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OtpRequest_phone_purpose_idx" ON "OtpRequest"("phone", "purpose");
CREATE INDEX IF NOT EXISTS "OtpRequest_expiresAt_idx" ON "OtpRequest"("expiresAt");

CREATE TABLE IF NOT EXISTS "RateLimitHit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "windowKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateLimitHit_identifier_windowKey_idx" ON "RateLimitHit"("identifier", "windowKey");

CREATE TABLE IF NOT EXISTS "PaymentEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "authority" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PaymentEvent_orderId_fkey'
  ) THEN
    ALTER TABLE "PaymentEvent"
      ADD CONSTRAINT "PaymentEvent_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "PaymentEvent_orderId_createdAt_idx" ON "PaymentEvent"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentEvent_gateway_authority_idx" ON "PaymentEvent"("gateway", "authority");
