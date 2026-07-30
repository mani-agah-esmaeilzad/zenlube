-- AlterTable
ALTER TABLE "Car"
ADD COLUMN IF NOT EXISTS "notebookSections" JSONB;
