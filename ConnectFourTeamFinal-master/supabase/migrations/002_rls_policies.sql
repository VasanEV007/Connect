-- ============================================================================
-- CONNECT - Amrita Collaboration Platform Database Schema
-- Migration 002: Row Level Security (RLS) Policies & Role Safeguards
-- ============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.od_slips ENABLE ROW LEVEL SECURITY;

-- Helper function: get the authenticated user's verified role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function: is current user faculty or admin?
CREATE OR REPLACE FUNCTION public.is_faculty_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'FACULTY' OR role = 'ADMIN')
  );
$$;

-- ----------------------------------------------------------------------------
-- PROFILES RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. All authenticated users can view profiles (for directory and opportunity hosts)
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Users can insert their own initial profile on signup
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id AND
  (role = 'STUDENT' OR role IS NULL) -- Default to STUDENT. Cannot self-assign FACULTY or ADMIN.
);

-- 3. Users can update only their own profile details
-- But CANNOT modify their assigned role or verification status!
CREATE POLICY "Users can update own profile fields"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND -- Prevents role self-elevation
  is_verified = (SELECT is_verified FROM public.profiles WHERE id = auth.uid()) -- Prevents self-verification
);

-- ----------------------------------------------------------------------------
-- OPPORTUNITIES RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. Opportunities are viewable by all authenticated users (Shared Feed)
CREATE POLICY "Opportunities viewable by all authenticated users"
ON public.opportunities FOR SELECT
TO authenticated
USING (true);

-- 2. Users can create opportunities
-- Faculty-only categories (FACULTY_WORKSHOP, FACULTY_RESEARCH) require faculty/admin role
CREATE POLICY "Users can create opportunities based on role"
ON public.opportunities FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = host_id AND
  (
    category NOT IN ('FACULTY_WORKSHOP', 'FACULTY_RESEARCH') OR
    public.is_faculty_or_admin()
  )
);

-- 3. Only the opportunity host can update their opportunity
CREATE POLICY "Hosts can update their opportunities"
ON public.opportunities FOR UPDATE
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- 4. Only the opportunity host can delete/cancel their opportunity
CREATE POLICY "Hosts can delete their opportunities"
ON public.opportunities FOR DELETE
TO authenticated
USING (auth.uid() = host_id);

-- ----------------------------------------------------------------------------
-- APPLICATIONS RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. An applicant can view their own application;
--    The opportunity host can view all applications for their opportunity.
CREATE POLICY "Applicants and hosts can view applications"
ON public.applications FOR SELECT
TO authenticated
USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.opportunities o 
    WHERE o.id = applications.post_id AND o.host_id = auth.uid()
  )
);

-- 2. Users can apply to an opportunity (only once due to UNIQUE constraint)
CREATE POLICY "Users can apply to open opportunities"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (
  applicant_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = applications.post_id AND o.host_id = auth.uid()
  ) -- Cannot apply to own opportunity
);

-- 3. Hosts can update application status (ACCEPT / REJECT / Mark Attended);
--    Applicants can withdraw (cancel) their own pending application.
CREATE POLICY "Hosts can review or applicants can update own applications"
ON public.applications FOR UPDATE
TO authenticated
USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.opportunities o 
    WHERE o.id = applications.post_id AND o.host_id = auth.uid()
  )
);

-- 4. Applicants can delete / withdraw their pending applications
CREATE POLICY "Applicants can withdraw applications"
ON public.applications FOR DELETE
TO authenticated
USING (applicant_id = auth.uid() AND status = 'PENDING');

-- ----------------------------------------------------------------------------
-- MESSAGES (SCOPED GROUP CHAT) RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. Messages can ONLY be viewed by the opportunity host OR confirmed (ACCEPTED) participants
CREATE POLICY "Scoped chat viewable only by host and accepted members"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = messages.post_id AND o.host_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.post_id = messages.post_id AND a.applicant_id = auth.uid() AND a.status = 'ACCEPTED'
  )
);

-- 2. Messages can ONLY be sent by the opportunity host OR confirmed (ACCEPTED) participants
CREATE POLICY "Scoped chat writable only by host and accepted members"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = messages.post_id AND o.host_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.post_id = messages.post_id AND a.applicant_id = auth.uid() AND a.status = 'ACCEPTED'
    )
  )
);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. Users can ONLY read their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- ON-DUTY (OD) SLIPS RLS POLICIES (INSTITUTIONAL REGISTRY)
-- ----------------------------------------------------------------------------

-- 1. Students can view their own OD slips;
--    Faculty can view OD slips they have issued;
--    Admins can audit all OD slips.
CREATE POLICY "OD slips viewable by student recipient and issuing faculty"
ON public.od_slips FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR
  faculty_id = auth.uid() OR
  public.get_current_user_role() = 'ADMIN'
);

-- 2. ONLY verified faculty host or admin can issue OD slips! Students CANNOT issue OD slips.
CREATE POLICY "Only faculty hosts can issue verified OD slips"
ON public.od_slips FOR INSERT
TO authenticated
WITH CHECK (
  faculty_id = auth.uid() AND
  public.is_faculty_or_admin() AND
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = od_slips.event_id AND o.host_id = auth.uid()
  )
);
