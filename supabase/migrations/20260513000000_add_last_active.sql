-- Add last_active to profiles for activity tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();
