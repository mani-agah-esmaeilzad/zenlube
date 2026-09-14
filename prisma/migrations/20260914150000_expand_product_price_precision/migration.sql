-- Product prices are stored in rial. Imported products can exceed 99,999,999 rial.
ALTER TABLE "Product"
  ALTER COLUMN "price" TYPE DECIMAL(12,2);
