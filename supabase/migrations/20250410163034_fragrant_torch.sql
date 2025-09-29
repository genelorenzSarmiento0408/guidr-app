/*
  # Add mentorship link to profiles
  
  1. Changes
    - Add mentorship_link column to profiles table
    - Add mentorship_price column to profiles table
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mentorship_link text,
ADD COLUMN IF NOT EXISTS mentorship_price numeric(10,2);