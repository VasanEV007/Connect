-- ============================================================================
-- CONNECT - Amrita Collaboration Platform Database Schema
-- Migration 001: Initial Schema (PostgreSQL / Supabase)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
-- Linked directly to Supabase Auth auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
    roll_number TEXT,
    department TEXT NOT NULL,
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

-- Index for searching users in Find People
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_roll ON public.profiles(roll_number);

-- 2. OPPORTUNITIES TABLE
-- Covers events, research, workshops, hackathons, sports, and integrated carpool/travel
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    host_name TEXT NOT NULL,
    host_role TEXT NOT NULL CHECK (host_role IN ('STUDENT', 'FACULTY', 'ADMIN')),
    host_designation TEXT,
    title TEXT NOT NULL CHECK (length(trim(title)) >= 5),
    description TEXT NOT NULL CHECK (length(trim(description)) >= 20),
    instructions TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'STUDENT_CASUAL',
        'STUDENT_CREATIVE',
        'CARPOOL',
        'FACULTY_WORKSHOP',
        'FACULTY_RESEARCH',
        'FACULTY_VOLUNTEER'
    )),
    join_mode TEXT NOT NULL DEFAULT 'UNLOCKED' CHECK (join_mode IN ('UNLOCKED', 'LOCKED')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'COMPLETED', 'CANCELLED')),
    total_slots INTEGER NOT NULL CHECK (total_slots > 0),
    filled_slots INTEGER NOT NULL DEFAULT 0 CHECK (filled_slots >= 0),
    required_skills TEXT[] DEFAULT '{}',
    eligible_departments TEXT[] DEFAULT '{"ANY"}',
    eligible_years INTEGER[] DEFAULT '{}',
    venue_name TEXT NOT NULL,
    map_lat NUMERIC(9, 6),
    map_lng NUMERIC(9, 6),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    od_available BOOLEAN DEFAULT FALSE,
    od_details TEXT,
    od_hours NUMERIC(4, 1) DEFAULT 0,
    research_perks TEXT,
    weekly_commitment_hours NUMERIC(4, 1),
    
    -- Travel & Carpool specific fields
    carpool_origin TEXT,
    carpool_destination TEXT,
    carpool_cost_split TEXT,
    carpool_gender_pref TEXT DEFAULT 'ANY' CHECK (carpool_gender_pref IN ('ANY', 'FEMALE_ONLY', 'MALE_ONLY')),
    carpool_seats_available INTEGER,
    carpool_notes TEXT,
    
    target_roles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_opportunity_times CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_opportunities_host ON public.opportunities(host_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_start ON public.opportunities(start_time);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);

-- 3. APPLICATIONS & REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_roll TEXT,
    applicant_dept TEXT,
    applicant_year INTEGER,
    applicant_skills TEXT[] DEFAULT '{}',
    assigned_role TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'INVITED')),
    attended BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate applications to the same opportunity
    CONSTRAINT uq_opportunity_applicant UNIQUE (post_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_post ON public.applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 4. MESSAGES TABLE (Scoped Group Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_roll TEXT,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_post ON public.messages(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'APP_SUBMITTED',
        'APP_APPROVED',
        'APP_REJECTED',
        'INVITE_RECEIVED',
        'SLOT_FULL',
        'OD_GENERATED',
        'EVENT_REMINDER'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_post_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    related_post_title TEXT,
    read BOOLEAN DEFAULT FALSE,
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- 6. VERIFIED ON-DUTY (OD) SLIPS TABLE
CREATE TABLE IF NOT EXISTS public.od_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    student_dept TEXT NOT NULL,
    student_year INTEGER NOT NULL,
    event_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    faculty_name TEXT NOT NULL,
    faculty_designation TEXT NOT NULL,
    faculty_dept TEXT NOT NULL,
    event_date DATE NOT NULL,
    od_hours NUMERIC(4, 1) NOT NULL CHECK (od_hours > 0),
    verification_hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_od_application UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_od_slips_student ON public.od_slips(student_id);
CREATE INDEX IF NOT EXISTS idx_od_slips_faculty ON public.od_slips(faculty_id);
CREATE INDEX IF NOT EXISTS idx_od_slips_hash ON public.od_slips(verification_hash);
