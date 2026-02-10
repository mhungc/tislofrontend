-- Migration: Make email required for shops
-- Date: 2026-02-10
-- Description: Updates existing shops without email and adds NOT NULL constraint

BEGIN;

-- Step 1: Update existing shops that don't have an email
-- Set a placeholder email for shops without one (you may want to handle this differently)
UPDATE shops 
SET email = CONCAT('shop-', id, '@placeholder.local')
WHERE email IS NULL OR email = '';

-- Step 2: Add NOT NULL constraint to email column
ALTER TABLE shops 
ALTER COLUMN email SET NOT NULL;

-- Step 3: Add a comment to document the change
COMMENT ON COLUMN shops.email IS 'Contact email for the shop (required)';

COMMIT;
