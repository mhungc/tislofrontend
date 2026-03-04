ALTER TABLE "public"."shops"
ADD COLUMN IF NOT EXISTS "bookingConfirmationMode" TEXT NOT NULL DEFAULT 'manual';
