-- Store monetary values in IRR; a 10,2 column overflows above 99,999,999 rial.
-- Extend all commerce money columns consistently so large baskets and discounts remain valid.
ALTER TABLE "Order"
  ALTER COLUMN "total" TYPE DECIMAL(14,2),
  ALTER COLUMN "shippingCost" TYPE DECIMAL(14,2),
  ALTER COLUMN "discountAmount" TYPE DECIMAL(14,2);

ALTER TABLE "OrderItem"
  ALTER COLUMN "price" TYPE DECIMAL(14,2);

ALTER TABLE "PaymentTransaction"
  ALTER COLUMN "amount" TYPE DECIMAL(14,2);

ALTER TABLE "ProductPromotion"
  ALTER COLUMN "specialPrice" TYPE DECIMAL(14,2);

ALTER TABLE "Coupon"
  ALTER COLUMN "amount" TYPE DECIMAL(14,2),
  ALTER COLUMN "minOrderAmount" TYPE DECIMAL(14,2),
  ALTER COLUMN "maxDiscountAmount" TYPE DECIMAL(14,2);

ALTER TABLE "ReturnRequest"
  ALTER COLUMN "refundAmount" TYPE DECIMAL(14,2);
