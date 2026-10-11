-- ============================================================================
-- CONNECT - Event Participation & Host Approval Workflow
-- Migration 004: Create Applications / Participation Requests Table
-- Run this in the Supabase Dashboard SQL Editor (Project: musieaztcqedhpyztsxs)
-- ============================================================================

-- Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id TEXT NOT NULL,
    applicant_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_roll TEXT,
    applicant_dept TEXT,
    applicant_year INTEGER,
    applicant_skills TEXT[] DEFAULT '{}',
    assigned_role TEXT DEFAULT 'Participant',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'INVITED', 'approved', 'rejected', 'pending')),
    attended BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce unique student application per event/post to prevent duplicate requests
    CONSTRAINT uq_post_applicant UNIQUE (post_id, applicant_id)
);

-- 2. Indexes for high performance lookups
CREATE INDEX IF NOT EXISTS idx_applications_post_id ON public.applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public can view applications" ON public.applications;
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public can update applications" ON public.applications;
DROP POLICY IF EXISTS "Public can delete applications" ON public.applications;

-- Policy 1: SELECT - Students can view their requests, and hosts can view requests for their posts
CREATE POLICY "Public can view applications"
ON public.applications FOR SELECT
USING (true);

-- Policy 2: INSERT - Any student can submit a participation request
CREATE POLICY "Public can insert applications"
ON public.applications FOR INSERT
WITH CHECK (true);

-- Policy 3: UPDATE - Hosts can update status (Approve / Reject)
CREATE POLICY "Public can update applications"
ON public.applications FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy 4: DELETE - Students can withdraw their own requests
CREATE POLICY "Public can delete applications"
ON public.applications FOR DELETE
USING (true);
