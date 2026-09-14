CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BlogPost"
ADD COLUMN "status" "BlogPostStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "seoDescription" TEXT,
ADD COLUMN "faqItems" JSONB,
ADD COLUMN "relatedProductSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "categoryId" TEXT;

CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE INDEX "BlogCategory_isActive_sortOrder_idx" ON "BlogCategory"("isActive", "sortOrder");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX "BlogPost_categoryId_status_publishedAt_idx" ON "BlogPost"("categoryId", "status", "publishedAt");
CREATE INDEX "BlogPost_isFeatured_status_sortOrder_idx" ON "BlogPost"("isFeatured", "status", "sortOrder");

ALTER TABLE "BlogPost"
ADD CONSTRAINT "BlogPost_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
