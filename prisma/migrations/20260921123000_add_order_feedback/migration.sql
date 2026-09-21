CREATE TYPE "FeedbackRequestStatus" AS ENUM ('PENDING', 'SENT', 'SUBMITTED');

CREATE TABLE "OrderFeedback" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "FeedbackRequestStatus" NOT NULL DEFAULT 'PENDING',
    "overallRating" INTEGER,
    "productQualityRating" INTEGER,
    "deliveryRating" INTEGER,
    "recommend" BOOLEAN,
    "comment" TEXT,
    "sendCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderFeedback_orderId_key" ON "OrderFeedback"("orderId");
CREATE UNIQUE INDEX "OrderFeedback_tokenHash_key" ON "OrderFeedback"("tokenHash");
CREATE INDEX "OrderFeedback_status_createdAt_idx" ON "OrderFeedback"("status", "createdAt");
CREATE INDEX "OrderFeedback_expiresAt_idx" ON "OrderFeedback"("expiresAt");

ALTER TABLE "OrderFeedback"
ADD CONSTRAINT "OrderFeedback_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderFeedback"
ADD CONSTRAINT "OrderFeedback_overallRating_check"
CHECK ("overallRating" IS NULL OR "overallRating" BETWEEN 1 AND 5);

ALTER TABLE "OrderFeedback"
ADD CONSTRAINT "OrderFeedback_productQualityRating_check"
CHECK ("productQualityRating" IS NULL OR "productQualityRating" BETWEEN 1 AND 5);

ALTER TABLE "OrderFeedback"
ADD CONSTRAINT "OrderFeedback_deliveryRating_check"
CHECK ("deliveryRating" IS NULL OR "deliveryRating" BETWEEN 1 AND 5);
