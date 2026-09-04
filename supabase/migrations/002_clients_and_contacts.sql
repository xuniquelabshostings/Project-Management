-- 002_clients_and_contacts.sql
-- Clients, Contacts, and Activity Timeline with strict RLS policies

-- 1. Create client status and lead source enums
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('lead', 'negotiation', 'active', 'on_hold', 'churned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM ('referral', 'upwork', 'linkedin', 'inbound', 'cold_outreach', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('call', 'meeting', 'email', 'whatsapp', 'decision', 'note', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    status client_status NOT NULL DEFAULT 'lead',
    lead_source lead_source DEFAULT 'other',
    tags TEXT[] NOT NULL DEFAULT '{}',
    account_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for RLS lookups
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON public.clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- 3. Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    preferred_channel TEXT CHECK (preferred_channel IN ('whatsapp', 'email', 'phone', 'other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON public.contacts(client_id);

-- 4. Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    logged_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type activity_type NOT NULL DEFAULT 'note',
    summary TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_log_client ON public.activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_occurred_at ON public.activity_log(occurred_at DESC);

-- 5. Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- 6. Helper function to check if user can manage a specific client
CREATE OR REPLACE FUNCTION public.can_manage_client(client_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_uuid
      AND (public.is_admin() OR c.account_manager_id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 7. RLS Policies: CLIENTS
-- SELECT
CREATE POLICY "Admins have full read access to clients"
    ON public.clients
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Account Managers can view their assigned clients"
    ON public.clients
    FOR SELECT
    TO authenticated
    USING (public.is_account_manager() AND account_manager_id = auth.uid());

-- INSERT
CREATE POLICY "Admins and Account Managers can create clients"
    ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() OR (
            public.is_account_manager() AND (account_manager_id = auth.uid() OR account_manager_id IS NULL)
        )
    );

-- UPDATE
CREATE POLICY "Admins can update all clients"
    ON public.clients
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Account Managers can update their assigned clients"
    ON public.clients
    FOR UPDATE
    TO authenticated
    USING (public.is_account_manager() AND account_manager_id = auth.uid())
    WITH CHECK (public.is_account_manager() AND account_manager_id = auth.uid());

-- DELETE
CREATE POLICY "Only admins can delete clients"
    ON public.clients
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 8. RLS Policies: CONTACTS
-- SELECT
CREATE POLICY "Admins and AMs can view contacts for their clients"
    ON public.contacts
    FOR SELECT
    TO authenticated
    USING (public.can_manage_client(client_id));

-- INSERT
CREATE POLICY "Admins and AMs can create contacts for their clients"
    ON public.contacts
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_client(client_id));

-- UPDATE
CREATE POLICY "Admins and AMs can update contacts for their clients"
    ON public.contacts
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_client(client_id))
    WITH CHECK (public.can_manage_client(client_id));

-- DELETE
CREATE POLICY "Admins and AMs can delete contacts for their clients"
    ON public.contacts
    FOR DELETE
    TO authenticated
    USING (public.can_manage_client(client_id));


-- 9. RLS Policies: ACTIVITY_LOG
-- SELECT
CREATE POLICY "Admins and AMs can view activity for their clients"
    ON public.activity_log
    FOR SELECT
    TO authenticated
    USING (public.can_manage_client(client_id));

-- INSERT
CREATE POLICY "Admins and AMs can log activity for their clients"
    ON public.activity_log
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.can_manage_client(client_id) AND logged_by = auth.uid()
    );

-- UPDATE / DELETE: Only creator or admin
CREATE POLICY "Activity log update restricted"
    ON public.activity_log
    FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR (logged_by = auth.uid() AND public.can_manage_client(client_id)));

CREATE POLICY "Activity log delete restricted"
    ON public.activity_log
    FOR DELETE
    TO authenticated
    USING (public.is_admin() OR (logged_by = auth.uid() AND public.can_manage_client(client_id)));
