ALTER TABLE "Cart"
ADD COLUMN "lastCartSeenAt" TIMESTAMP(3),
ADD COLUMN "checkoutStartedAt" TIMESTAMP(3),
ADD COLUMN "checkoutLastSeenAt" TIMESTAMP(3);

CREATE INDEX "Cart_lastCartSeenAt_idx" ON "Cart"("lastCartSeenAt");
CREATE INDEX "Cart_checkoutLastSeenAt_idx" ON "Cart"("checkoutLastSeenAt");
CREATE INDEX "CartItem_updatedAt_cartId_idx" ON "CartItem"("updatedAt", "cartId");
