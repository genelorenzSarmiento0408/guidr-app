/*
  # Backfill profiles for existing auth users
  
  This migration creates profiles for any existing users in auth.users
  who don't already have a profile in the profiles table.
*/

-- Insert profiles for existing users who don't have one
INSERT INTO public.profiles (id, user_id, username, program, year_standing, skills, chat_link, photo_url, user_type)
SELECT 
  au.id,
  au.id,
  -- Generate username from metadata or email
  COALESCE(
    au.raw_user_meta_data->>'organization_name',
    CONCAT(au.raw_user_meta_data->>'first_name', ' ', au.raw_user_meta_data->>'last_name'),
    split_part(au.email, '@', 1),
    'User_' || substring(au.id::text, 1, 8)
  ) as username,
  -- Program from metadata or default
  COALESCE(au.raw_user_meta_data->>'profession', 'Organization') as program,
  -- Year standing based on role
  CASE 
    WHEN au.raw_user_meta_data->>'role' = 'mentor' THEN 'Mentor'
    ELSE 'N/A'
  END as year_standing,
  '' as skills,
  '' as chat_link,
  COALESCE(au.raw_user_meta_data->>'avatar_url', '') as photo_url,
  -- User type array based on role
  CASE 
    WHEN au.raw_user_meta_data->>'role' = 'mentor' THEN ARRAY['student']::text[]
    ELSE ARRAY['company']::text[]
  END as user_type
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL  -- Only insert for users without profiles
ON CONFLICT (user_id) DO NOTHING;
