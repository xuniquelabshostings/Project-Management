-- 015_complete_single_user_setup.sql
-- Grants unconditional full access to both anon and authenticated roles
-- and ensures all columns across clients, projects, invoices, tasks, and activity_log exist.

-- 1. Ensure columns on public.clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS domain_name TEXT,
  ADD COLUMN IF NOT EXISTS domain_registrar TEXT,
  ADD COLUMN IF NOT EXISTS domain_registered_at DATE,
  ADD COLUMN IF NOT EXISTS domain_renew_at DATE,
  ADD COLUMN IF NOT EXISTS domain_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS hosting_provider TEXT,
  ADD COLUMN IF NOT EXISTS hosting_plan TEXT,
  ADD COLUMN IF NOT EXISTS hosting_activated_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_renew_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS renewal_alert_days INTEGER DEFAULT 30;

-- 2. Ensure columns on public.projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS domain_name TEXT,
  ADD COLUMN IF NOT EXISTS domain_registrar TEXT,
  ADD COLUMN IF NOT EXISTS domain_registered_at DATE,
  ADD COLUMN IF NOT EXISTS domain_renew_at DATE,
  ADD COLUMN IF NOT EXISTS domain_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS hosting_provider TEXT,
  ADD COLUMN IF NOT EXISTS hosting_plan TEXT,
  ADD COLUMN IF NOT EXISTS hosting_activated_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_renew_at DATE,
  ADD COLUMN IF NOT EXISTS hosting_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS renewal_alert_days INTEGER DEFAULT 30;

-- 3. Relax foreign key constraints on task author / activity logger if needed
DO $$
BEGIN
  ALTER TABLE public.tasks ALTER COLUMN created_by DROP NOT NULL;
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE public.activity_log ALTER COLUMN logged_by DROP NOT NULL;
EXCEPTION
  WHEN others THEN null;
END $$;

-- 4. Enable RLS and create full access policies for both anon and authenticated

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Admin full access to clients" ON public.clients;
CREATE POLICY "Public and authenticated full access to clients"
  ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin full access to contacts" ON public.contacts;
CREATE POLICY "Public and authenticated full access to contacts"
  ON public.contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON public.projects;
CREATE POLICY "Public and authenticated full access to projects"
  ON public.projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks;
CREATE POLICY "Public and authenticated full access to tasks"
  ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admin full access to milestones" ON public.milestones;
CREATE POLICY "Public and authenticated full access to milestones"
  ON public.milestones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin full access to invoices" ON public.invoices;
CREATE POLICY "Public and authenticated full access to invoices"
  ON public.invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Invoice Line Items
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to invoice_line_items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admin full access to invoice_line_items" ON public.invoice_line_items;
CREATE POLICY "Public and authenticated full access to invoice_line_items"
  ON public.invoice_line_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admin full access to proposals" ON public.proposals;
CREATE POLICY "Public and authenticated full access to proposals"
  ON public.proposals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Admin full access to activity_log" ON public.activity_log;
CREATE POLICY "Public and authenticated full access to activity_log"
  ON public.activity_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and authenticated full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Public and authenticated full access to profiles"
  ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Documents (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public and authenticated full access to documents" ON public.documents;
    CREATE POLICY "Public and authenticated full access to documents"
      ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
