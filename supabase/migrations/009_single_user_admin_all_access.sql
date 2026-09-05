-- 009_single_user_admin_all_access.sql
-- Reconfigures system to Single-User mode: All access granted as Admin across all tables.

-- 0. Ensure user_role enum type exists if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'account_manager', 'developer');
  END IF;
END $$;

-- 1. Helper functions: Return true / 'admin' for full unconditional system access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION public.is_account_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_client(client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT true;
$$;

-- Drop prior function to avoid return type mismatch
DROP FUNCTION IF EXISTS public.current_user_role();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 'admin'::text;
$$;

-- 2. Update default role on profiles table to 'admin'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'admin';

-- 3. Set all profiles to 'admin'
UPDATE public.profiles SET role = 'admin' WHERE role::text != 'admin';

-- 4. Sync any auth.users into profiles as admin
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Admin'), 
    'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- 5. Full access RLS policies on all tables for authenticated administrator

-- Invoices
DROP POLICY IF EXISTS "Admins and AMs view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and AMs insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and AMs update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin full access to invoices" ON public.invoices;

CREATE POLICY "Admin full access to invoices"
    ON public.invoices
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoice Line Items
DROP POLICY IF EXISTS "Admins and AMs view line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins and AMs insert line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins and AMs update line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins delete line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admin full access to invoice_line_items" ON public.invoice_line_items;

CREATE POLICY "Admin full access to invoice_line_items"
    ON public.invoice_line_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Clients
DROP POLICY IF EXISTS "Admins and Account Managers can read clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and Account Managers can create clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and Account Managers can update clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Admin full access to clients" ON public.clients;

CREATE POLICY "Admin full access to clients"
    ON public.clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Contacts
DROP POLICY IF EXISTS "Admins and AMs read contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins and AMs write contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin full access to contacts" ON public.contacts;

CREATE POLICY "Admin full access to contacts"
    ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Internal users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and AMs can create projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and AMs can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON public.projects;

CREATE POLICY "Admin full access to projects"
    ON public.projects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Tasks
DROP POLICY IF EXISTS "Users can view tasks of visible projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins and AMs can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks;

CREATE POLICY "Admin full access to tasks"
    ON public.tasks
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Milestones
DROP POLICY IF EXISTS "Users view milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admins and AMs manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admin full access to milestones" ON public.milestones;

CREATE POLICY "Admin full access to milestones"
    ON public.milestones
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Proposals
DROP POLICY IF EXISTS "Admins and AMs view proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins and AMs insert proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins and AMs update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins delete proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admin full access to proposals" ON public.proposals;

CREATE POLICY "Admin full access to proposals"
    ON public.proposals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Documents
DROP POLICY IF EXISTS "Users view documents" ON public.documents;
DROP POLICY IF EXISTS "Users insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users delete documents" ON public.documents;
DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;

CREATE POLICY "Admin full access to documents"
    ON public.documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own non-role profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;

CREATE POLICY "Admin full access to profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Activity Log
DROP POLICY IF EXISTS "Users view activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Users insert activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Admin full access to activity_log" ON public.activity_log;

CREATE POLICY "Admin full access to activity_log"
    ON public.activity_log
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
