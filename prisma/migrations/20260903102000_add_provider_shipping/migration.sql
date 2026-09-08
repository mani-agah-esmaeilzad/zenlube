-- Internal, provider-agnostic shipping domain.
-- All monetary values remain in Oilbar's canonical IRR unit.

CREATE TYPE "ShippingDimensionsMode" AS ENUM ('DEFAULT', 'CUSTOM');
CREATE TYPE "ShippingQuoteStatus" AS ENUM ('PENDING', 'READY', 'PARTIAL', 'FAILED');
CREATE TYPE "ShipmentStatus" AS ENUM (
  'PENDING',
  'READY_TO_SHIP',
  'SUBMITTING',
  'SUBMITTED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
  'UNKNOWN',
  'CANCELLED'
);
CREATE TYPE "ShippingLocationKind" AS ENUM ('PROVINCE', 'CITY');

ALTER TABLE "Product"
  ADD COLUMN "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "shippingWeightGrams" INTEGER,
  ADD COLUMN "shippingDimensionsMode" "ShippingDimensionsMode" NOT NULL DEFAULT 'DEFAULT',
  ADD COLUMN "shippingLengthCm" INTEGER,
  ADD COLUMN "shippingWidthCm" INTEGER,
  ADD COLUMN "shippingHeightCm" INTEGER,
  ADD COLUMN "shippingRestrictedCarriers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "shippingIsLiquid" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Cart"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "UserAddress"
  ADD COLUMN "provinceCode" TEXT,
  ADD COLUMN "cityCode" TEXT;

ALTER TABLE "Order"
  ALTER COLUMN "shippingMethod" DROP DEFAULT,
  ALTER COLUMN "shippingMethod" DROP NOT NULL,
  ADD COLUMN "provinceCode" TEXT,
  ADD COLUMN "cityCode" TEXT,
  ADD COLUMN "checkoutIdempotencyKey" TEXT,
  ADD COLUMN "shippingQuoteOptionId" TEXT,
  ADD COLUMN "shippingProviderKey" TEXT,
  ADD COLUMN "shippingCarrierCode" TEXT,
  ADD COLUMN "shippingCarrierLabel" TEXT,
  ADD COLUMN "shippingServiceCode" TEXT,
  ADD COLUMN "shippingServiceLabel" TEXT,
  ADD COLUMN "shippingBaseCost" DECIMAL(12,2),
  ADD COLUMN "shippingAdjustmentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingCurrency" TEXT NOT NULL DEFAULT 'IRR',
  ADD COLUMN "shippingPackageWeightGrams" INTEGER,
  ADD COLUMN "shippingPackageLengthCm" INTEGER,
  ADD COLUMN "shippingPackageWidthCm" INTEGER,
  ADD COLUMN "shippingPackageHeightCm" INTEGER,
  ADD COLUMN "shippingPackageTypeCode" TEXT,
  ADD COLUMN "shippingIsLiquid" BOOLEAN,
  ADD COLUMN "shippingQuotedAt" TIMESTAMP(3),
  ADD COLUMN "shippingQuoteExpiresAt" TIMESTAMP(3),
  ADD COLUMN "shippingTrackingUrl" TEXT,
  ADD COLUMN "shippingExternalStatus" TEXT;

CREATE TABLE "ShippingSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "providerKey" TEXT NOT NULL DEFAULT 'amadast',
  "providerStoreId" TEXT,
  "providerProductTypeCode" TEXT,
  "originProvinceCode" TEXT,
  "originProvinceName" TEXT,
  "originCityCode" TEXT,
  "originCityName" TEXT,
  "originAddress" TEXT,
  "originPostalCode" TEXT,
  "senderName" TEXT,
  "senderMobile" TEXT,
  "enabledCarriers" TEXT[] NOT NULL DEFAULT ARRAY['POST', 'TIPAX']::TEXT[],
  "basePackagingWeightGrams" INTEGER NOT NULL DEFAULT 100,
  "extraPackagingWeightPerAdditionalItemGrams" INTEGER NOT NULL DEFAULT 0,
  "minimumPackageWeightGrams" INTEGER NOT NULL DEFAULT 10,
  "defaultLengthCm" INTEGER NOT NULL DEFAULT 20,
  "defaultWidthCm" INTEGER NOT NULL DEFAULT 15,
  "defaultHeightCm" INTEGER NOT NULL DEFAULT 10,
  "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
  "freeShippingThresholdRials" DECIMAL(12,2),
  "adjustmentFixedRials" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "adjustmentPercent" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "manualFallbackEnabled" BOOLEAN NOT NULL DEFAULT false,
  "manualFallbackLabel" TEXT,
  "manualFallbackCostRials" DECIMAL(12,2),
  "quoteTtlSeconds" INTEGER NOT NULL DEFAULT 600,
  "providerTimeoutMs" INTEGER NOT NULL DEFAULT 6000,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingQuoteRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "cartVersion" INTEGER NOT NULL,
  "providerKey" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "cacheBucket" TEXT NOT NULL,
  "destinationProvinceCode" TEXT NOT NULL,
  "destinationCityCode" TEXT NOT NULL,
  "destinationPostalCode" TEXT NOT NULL,
  "destinationAddressHash" TEXT NOT NULL,
  "declaredValue" DECIMAL(12,2) NOT NULL,
  "packageWeightGrams" INTEGER NOT NULL,
  "packageLengthCm" INTEGER NOT NULL,
  "packageWidthCm" INTEGER NOT NULL,
  "packageHeightCm" INTEGER NOT NULL,
  "packageTypeCode" TEXT,
  "status" "ShippingQuoteStatus" NOT NULL DEFAULT 'PENDING',
  "providerRequestId" TEXT,
  "quotedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "providerErrors" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingQuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingLocation" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "kind" "ShippingLocationKind" NOT NULL,
  "name" TEXT NOT NULL,
  "parentCode" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingProviderLocationMap" (
  "id" TEXT NOT NULL,
  "locationCode" TEXT NOT NULL,
  "providerKey" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "externalParentId" TEXT,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShippingProviderLocationMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingQuoteOption" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "carrierCode" TEXT NOT NULL,
  "carrierLabel" TEXT NOT NULL,
  "serviceCode" TEXT NOT NULL,
  "serviceLabel" TEXT NOT NULL,
  "externalQuoteId" TEXT,
  "baseCost" DECIMAL(12,2) NOT NULL,
  "adjustmentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "customerCost" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'IRR',
  "isFree" BOOLEAN NOT NULL DEFAULT false,
  "estimatedDeliveryLabel" TEXT,
  "estimatedMinDays" INTEGER,
  "estimatedMaxDays" INTEGER,
  "providerMetadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShippingQuoteOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Shipment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "providerKey" TEXT NOT NULL,
  "carrierCode" TEXT NOT NULL,
  "operationKey" TEXT NOT NULL,
  "externalOrderNumber" SERIAL NOT NULL,
  "externalShipmentId" TEXT,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
  "externalStatus" TEXT,
  "trackingCode" TEXT,
  "trackingUrl" TEXT,
  "labelUrl" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastErrorCode" TEXT,
  "lastErrorMessage" TEXT,
  "submittedAt" TIMESTAMP(3),
  "pickedUpAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_shippingQuoteOptionId_key" ON "Order"("shippingQuoteOptionId");
CREATE UNIQUE INDEX "Order_userId_checkoutIdempotencyKey_key" ON "Order"("userId", "checkoutIdempotencyKey");
CREATE INDEX "Order_shippingCarrierCode_createdAt_idx" ON "Order"("shippingCarrierCode", "createdAt");
CREATE UNIQUE INDEX "ShippingQuoteRequest_userId_fingerprint_cacheBucket_key" ON "ShippingQuoteRequest"("userId", "fingerprint", "cacheBucket");
CREATE INDEX "ShippingQuoteRequest_userId_cartId_fingerprint_expiresAt_idx" ON "ShippingQuoteRequest"("userId", "cartId", "fingerprint", "expiresAt");
CREATE INDEX "ShippingQuoteRequest_status_expiresAt_idx" ON "ShippingQuoteRequest"("status", "expiresAt");
CREATE INDEX "ShippingQuoteRequest_cartId_idx" ON "ShippingQuoteRequest"("cartId");
CREATE UNIQUE INDEX "ShippingLocation_code_key" ON "ShippingLocation"("code");
CREATE INDEX "ShippingLocation_kind_isActive_name_idx" ON "ShippingLocation"("kind", "isActive", "name");
CREATE INDEX "ShippingLocation_parentCode_isActive_name_idx" ON "ShippingLocation"("parentCode", "isActive", "name");
CREATE UNIQUE INDEX "ShippingProviderLocationMap_locationCode_providerKey_key" ON "ShippingProviderLocationMap"("locationCode", "providerKey");
CREATE UNIQUE INDEX "ShippingProviderLocationMap_providerKey_externalId_key" ON "ShippingProviderLocationMap"("providerKey", "externalId");
CREATE INDEX "ShippingProviderLocationMap_providerKey_externalParentId_idx" ON "ShippingProviderLocationMap"("providerKey", "externalParentId");
CREATE INDEX "ShippingProviderLocationMap_locationCode_idx" ON "ShippingProviderLocationMap"("locationCode");
CREATE UNIQUE INDEX "ShippingQuoteOption_requestId_carrierCode_serviceCode_key" ON "ShippingQuoteOption"("requestId", "carrierCode", "serviceCode");
CREATE INDEX "ShippingQuoteOption_requestId_customerCost_idx" ON "ShippingQuoteOption"("requestId", "customerCost");
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");
CREATE UNIQUE INDEX "Shipment_operationKey_key" ON "Shipment"("operationKey");
CREATE UNIQUE INDEX "Shipment_externalOrderNumber_key" ON "Shipment"("externalOrderNumber");
CREATE UNIQUE INDEX "Shipment_providerKey_externalShipmentId_key" ON "Shipment"("providerKey", "externalShipmentId");
CREATE INDEX "Shipment_status_updatedAt_idx" ON "Shipment"("status", "updatedAt");
CREATE INDEX "Shipment_carrierCode_status_idx" ON "Shipment"("carrierCode", "status");

ALTER TABLE "ShippingQuoteRequest"
  ADD CONSTRAINT "ShippingQuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ShippingQuoteRequest_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShippingQuoteOption"
  ADD CONSTRAINT "ShippingQuoteOption_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ShippingQuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShippingProviderLocationMap"
  ADD CONSTRAINT "ShippingProviderLocationMap_locationCode_fkey" FOREIGN KEY ("locationCode") REFERENCES "ShippingLocation"("code") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_shippingQuoteOptionId_fkey" FOREIGN KEY ("shippingQuoteOptionId") REFERENCES "ShippingQuoteOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Shipment"
  ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Product_shipping_values_positive') THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_shipping_values_positive" CHECK (
      ("shippingWeightGrams" IS NULL OR "shippingWeightGrams" > 0) AND
      ("shippingLengthCm" IS NULL OR "shippingLengthCm" > 0) AND
      ("shippingWidthCm" IS NULL OR "shippingWidthCm" > 0) AND
      ("shippingHeightCm" IS NULL OR "shippingHeightCm" > 0)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ShippingSettings_shipping_values_valid') THEN
    ALTER TABLE "ShippingSettings" ADD CONSTRAINT "ShippingSettings_shipping_values_valid" CHECK (
      "basePackagingWeightGrams" >= 0 AND
      "extraPackagingWeightPerAdditionalItemGrams" >= 0 AND
      "minimumPackageWeightGrams" > 0 AND
      "defaultLengthCm" > 0 AND "defaultWidthCm" > 0 AND "defaultHeightCm" > 0 AND
      "quoteTtlSeconds" BETWEEN 60 AND 3600 AND
      "providerTimeoutMs" BETWEEN 1000 AND 20000
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ShippingQuoteRequest_quote_values_valid') THEN
    ALTER TABLE "ShippingQuoteRequest" ADD CONSTRAINT "ShippingQuoteRequest_quote_values_valid" CHECK (
      "packageWeightGrams" > 0 AND
      "packageLengthCm" > 0 AND "packageWidthCm" > 0 AND "packageHeightCm" > 0 AND
      "declaredValue" >= 0 AND "expiresAt" > "createdAt"
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ShippingQuoteOption_costs_nonnegative') THEN
    ALTER TABLE "ShippingQuoteOption" ADD CONSTRAINT "ShippingQuoteOption_costs_nonnegative" CHECK (
      "baseCost" >= 0 AND "customerCost" >= 0
    );
  END IF;
END $$;
