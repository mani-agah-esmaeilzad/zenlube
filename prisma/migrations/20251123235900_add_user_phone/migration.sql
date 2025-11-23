-- Add phone column to User if it does not exist yet
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Ensure uniqueness constraint on phone numbers
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
