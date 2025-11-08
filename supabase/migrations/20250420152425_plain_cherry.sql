/*
  # Add user type to profiles
  
  1. Changes
    - Add user_type column to profiles table to store array of user types
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_type text[];