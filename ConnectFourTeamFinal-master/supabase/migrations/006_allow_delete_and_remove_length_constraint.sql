-- ============================================================================
-- CONNECT - Migration 006: Delete Operations & Remove Description Length Constraint
-- Allows event hosts to delete events and participants to cancel participation
-- Removes the 20-character minimum constraint on descriptions
-- ============================================================================

-- 1. Remove 20-character check constraints on opportunities description
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = 'opportunities' 
          AND ccu.column_name = 'description'
          AND tc.constraint_type = 'CHECK'
    ) LOOP
        EXECUTE 'ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Also drop chk_opportunity_description if explicitly named
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS chk_opportunity_description;
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_description_check;

-- 2. Ensure DELETE policies on public.events
DROP POLICY IF EXISTS "Public can delete events" ON public.events;
DROP POLICY IF EXISTS "Allow delete events" ON public.events;
CREATE POLICY "Public can delete events"
ON public.events FOR DELETE
USING (true);

-- 3. Ensure DELETE policies on public.opportunities
DROP POLICY IF EXISTS "Hosts can delete their opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow delete opportunities" ON public.opportunities;
CREATE POLICY "Allow delete opportunities"
ON public.opportunities FOR DELETE
USING (true);

-- 4. Ensure DELETE policies on public.applications (allows participants to cancel participation or withdraw)
DROP POLICY IF EXISTS "Applicants can withdraw applications" ON public.applications;
DROP POLICY IF EXISTS "Allow delete applications" ON public.applications;
CREATE POLICY "Allow delete applications"
ON public.applications FOR DELETE
USING (true);

-- 5. If event_participants table exists, ensure DELETE policy
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participants') THEN
        DROP POLICY IF EXISTS "Allow delete event_participants" ON public.event_participants;
        CREATE POLICY "Allow delete event_participants"
        ON public.event_participants FOR DELETE
        USING (true);
    END IF;
END $$;
