-- ============================================================================
-- CONNECT - Migration 008: Remove profiles_id_fkey constraint so profile
-- creation always succeeds and persists in Supabase profiles database
-- ============================================================================

-- 1. Drop foreign key constraint on auth.users so profile insertion never fails
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Ensure gen_random_uuid() is default if id is omitted
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Ensure RLS allows all selects, inserts, updates
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert"
ON public.profiles FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
CREATE POLICY "Allow profile update"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);
