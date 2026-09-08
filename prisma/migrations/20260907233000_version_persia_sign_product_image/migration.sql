-- Use a new canonical asset URL so storefront/CDN/Torob caches cannot retain
-- the old unrelated 300px montage for this exact product.
UPDATE "Product"
SET
  "imageUrl" = '/products/persia-sign/up-to-5-450ml-original.webp',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'persia-sign-up-to-5-octane-booster-450ml';
