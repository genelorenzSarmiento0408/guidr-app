-- Enforce role-aware RLS for student vs organization behavior.
-- Goals:
-- 1) Only organization accounts can create/update/delete opportunity posts.
-- 2) Profile writes remain owner-only and role values are constrained.

-- Helper: true when auth user has company role in profiles.user_type.
CREATE OR REPLACE FUNCTION public.is_company_user(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = uid
      AND 'company' = ANY (COALESCE(p.user_type, ARRAY[]::text[]))
  );
$$;

-- Helper: true when auth user has student role in profiles.user_type.
CREATE OR REPLACE FUNCTION public.is_student_user(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = uid
      AND 'student' = ANY (COALESCE(p.user_type, ARRAY[]::text[]))
  );
$$;

-- Replace generic profile write policies with role-constrained owner writes.
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND COALESCE(array_length(user_type, 1), 0) > 0
    AND user_type <@ ARRAY['student', 'company']::text[]
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND COALESCE(array_length(user_type, 1), 0) > 0
    AND user_type <@ ARRAY['student', 'company']::text[]
  );

-- Replace post write policies so only organization accounts can manage posts.
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Organizations can create own posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_company_user(auth.uid())
  );

CREATE POLICY "Organizations can update own posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND public.is_company_user(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_company_user(auth.uid())
  );

CREATE POLICY "Organizations can delete own posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND public.is_company_user(auth.uid())
  );
