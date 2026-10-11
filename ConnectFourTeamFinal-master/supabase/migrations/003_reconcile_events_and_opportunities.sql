-- ============================================================================
-- CONNECT - Database Schema & Events Reconciliation
-- Migration 003: Reconcile Events Table, Opportunities, and Complete Cloud Schema
-- Run this in the Supabase Dashboard SQL Editor (Project: musieaztcqedhpyztsxs)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure PROFILES table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
    roll_number TEXT,
    department TEXT NOT NULL DEFAULT 'Engineering',
    joining_year INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    bio TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    designation TEXT,
    cabin_or_lab TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RECONCILE EVENTS TABLE (Add missing columns to existing events table)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'STUDENT_CASUAL',
    location TEXT DEFAULT 'Academic Block 1',
    event_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all extended Connect fields to events table idempotently
DO $$ 
BEGIN
    -- Host details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'host_id') THEN
        ALTER TABLE public.events ADD COLUMN host_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'host_name') THEN
        ALTER TABLE public.events ADD COLUMN host_name TEXT DEFAULT 'Campus Organizer';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'host_role') THEN
        ALTER TABLE public.events ADD COLUMN host_role TEXT DEFAULT 'STUDENT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'host_designation') THEN
        ALTER TABLE public.events ADD COLUMN host_designation TEXT;
    END IF;

    -- Logistics & timing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_name') THEN
        ALTER TABLE public.events ADD COLUMN venue_name TEXT DEFAULT 'Academic Block 1';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
        ALTER TABLE public.events ADD COLUMN start_time TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
        ALTER TABLE public.events ADD COLUMN end_time TIMESTAMPTZ DEFAULT (NOW() + interval '2 hours');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'total_slots') THEN
        ALTER TABLE public.events ADD COLUMN total_slots INTEGER DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'filled_slots') THEN
        ALTER TABLE public.events ADD COLUMN filled_slots INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'join_mode') THEN
        ALTER TABLE public.events ADD COLUMN join_mode TEXT DEFAULT 'UNLOCKED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status') THEN
        ALTER TABLE public.events ADD COLUMN status TEXT DEFAULT 'OPEN';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'instructions') THEN
        ALTER TABLE public.events ADD COLUMN instructions TEXT;
    END IF;

    -- Skills & eligibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'required_skills') THEN
        ALTER TABLE public.events ADD COLUMN required_skills TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'eligible_departments') THEN
        ALTER TABLE public.events ADD COLUMN eligible_departments TEXT[] DEFAULT '{"ANY"}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'eligible_years') THEN
        ALTER TABLE public.events ADD COLUMN eligible_years INTEGER[] DEFAULT '{2022, 2023, 2024, 2025}';
    END IF;

    -- OD & Research
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'od_available') THEN
        ALTER TABLE public.events ADD COLUMN od_available BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'od_details') THEN
        ALTER TABLE public.events ADD COLUMN od_details TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'od_hours') THEN
        ALTER TABLE public.events ADD COLUMN od_hours NUMERIC(4, 1) DEFAULT 0;
    END IF;

    -- Carpool / Travel
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'carpool_origin') THEN
        ALTER TABLE public.events ADD COLUMN carpool_origin TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'carpool_destination') THEN
        ALTER TABLE public.events ADD COLUMN carpool_destination TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'carpool_cost_split') THEN
        ALTER TABLE public.events ADD COLUMN carpool_cost_split TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'carpool_gender_pref') THEN
        ALTER TABLE public.events ADD COLUMN carpool_gender_pref TEXT DEFAULT 'ANY';
    END IF;
END $$;

-- 3. Create OPPORTUNITIES table (or view pointing to events)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID,
    host_name TEXT NOT NULL DEFAULT 'Campus Organizer',
    host_role TEXT NOT NULL DEFAULT 'STUDENT',
    host_designation TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    category TEXT NOT NULL DEFAULT 'STUDENT_CASUAL',
    join_mode TEXT NOT NULL DEFAULT 'UNLOCKED',
    status TEXT NOT NULL DEFAULT 'OPEN',
    total_slots INTEGER NOT NULL DEFAULT 5,
    filled_slots INTEGER NOT NULL DEFAULT 0,
    required_skills TEXT[] DEFAULT '{}',
    eligible_departments TEXT[] DEFAULT '{"ANY"}',
    eligible_years INTEGER[] DEFAULT '{2022, 2023, 2024, 2025}',
    venue_name TEXT NOT NULL DEFAULT 'Academic Block 1',
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ DEFAULT (NOW() + interval '2 hours'),
    od_available BOOLEAN DEFAULT FALSE,
    od_details TEXT,
    od_hours NUMERIC(4, 1) DEFAULT 0,
    carpool_origin TEXT,
    carpool_destination TEXT,
    carpool_cost_split TEXT,
    carpool_gender_pref TEXT DEFAULT 'ANY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on events and opportunities
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Clean existing conflicting policies if re-running
DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Public can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated can insert events" ON public.events;
DROP POLICY IF EXISTS "Public can update events" ON public.events;

DROP POLICY IF EXISTS "Public can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Public can insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated can insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Public can update opportunities" ON public.opportunities;

-- Safe, accessible policies for events
CREATE POLICY "Public can view events"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Authenticated can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow anon insert if auth is optional/demo
CREATE POLICY "Public can insert events"
ON public.events FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public can update events"
ON public.events FOR UPDATE
USING (true)
WITH CHECK (true);

-- Safe, accessible policies for opportunities
CREATE POLICY "Public can view opportunities"
ON public.opportunities FOR SELECT
USING (true);

CREATE POLICY "Authenticated can insert opportunities"
ON public.opportunities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Public can insert opportunities"
ON public.opportunities FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public can update opportunities"
ON public.opportunities FOR UPDATE
USING (true)
WITH CHECK (true);
