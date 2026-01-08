-- Add headline and collaboration_link columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS collaboration_link text;
