CREATE TABLE IF NOT EXISTS "SmsLog" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "templateName" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "providerResponse" JSONB,
    "dedupeKey" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SmsLog_dedupeKey_key" ON "SmsLog"("dedupeKey");
CREATE INDEX IF NOT EXISTS "SmsLog_phone_eventType_createdAt_idx" ON "SmsLog"("phone", "eventType", "createdAt");
