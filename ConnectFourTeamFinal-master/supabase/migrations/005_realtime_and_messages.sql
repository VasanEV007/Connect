-- ============================================================================
-- CONNECT - Migration 005: Create Messages Table and Enable Supabase Realtime
-- Enables live group chat and automatic state updates for applications & opportunities
-- ============================================================================

-- 1. Create MESSAGES table for group chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'STUDENT',
    sender_roll TEXT,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_post ON public.messages(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);

-- Set replica identity to full so update/delete events contain row data in Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER TABLE public.opportunities REPLICA IDENTITY FULL;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

-- Allow reading messages for the event
CREATE POLICY "messages_select_policy" ON public.messages
    FOR SELECT USING (true);

-- Allow inserting messages with non-empty content
CREATE POLICY "messages_insert_policy" ON public.messages
    FOR INSERT WITH CHECK (length(trim(content)) > 0);

-- 3. Add tables to supabase_realtime publication for WebSocket broadcasting
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;
