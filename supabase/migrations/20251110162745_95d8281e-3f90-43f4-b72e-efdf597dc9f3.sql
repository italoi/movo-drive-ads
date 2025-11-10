-- Update ad_play_logs table to use driver_id instead of driver_email
-- This improves privacy by not storing PII directly in logs

-- Add driver_id column
ALTER TABLE public.ad_play_logs 
ADD COLUMN driver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records if any (this will fail if there are records, which is fine for a new system)
-- If you have existing data, you'd need a custom migration script to map emails to user_ids

-- Make driver_id NOT NULL after data migration (if needed)
ALTER TABLE public.ad_play_logs 
ALTER COLUMN driver_id SET NOT NULL;

-- Drop the old driver_email column
ALTER TABLE public.ad_play_logs 
DROP COLUMN driver_email;