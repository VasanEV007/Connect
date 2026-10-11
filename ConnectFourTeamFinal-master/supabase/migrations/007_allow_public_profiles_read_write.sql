-- ============================================================================
-- CONNECT - Amrita Collaboration Platform Database Schema
-- Migration 007: Allow public profile visibility and seamless profile upsert
-- ============================================================================

-- 1. Allow everyone (both anonymous visitors and authenticated users) to view all profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- 2. Allow profile creation on signup (supports both student and faculty roles)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;

CREATE POLICY "Allow profile insert"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- 3. Allow profile update
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;

CREATE POLICY "Allow profile update"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- 4. Enable Realtime on profiles table so newly registered users appear live
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
