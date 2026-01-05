/*
  # Auto-create profile on user signup
  
  1. Creates a trigger function that automatically creates a profile entry
     when a new user signs up via auth.users
  2. This ensures the profile is created with proper authentication context
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_value text;
BEGIN
  -- Generate a unique username
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Add user id suffix to ensure uniqueness if username already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) THEN
    username_value := username_value || '_' || substring(NEW.id::text, 1, 8);
  END IF;

  INSERT INTO public.profiles (id, user_id, username, program, year_standing, skills, chat_link, photo_url, user_type)
  VALUES (
    NEW.id,
    NEW.id,
    username_value,
    COALESCE(NEW.raw_user_meta_data->>'profession', 'Organization'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'mentor' THEN 'Mentor'
      ELSE 'N/A'
    END,
    '',
    '',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'mentor' THEN ARRAY['student']::text[]
      ELSE ARRAY['company']::text[]
    END
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
