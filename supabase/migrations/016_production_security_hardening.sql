-- 016_production_security_hardening.sql
-- Production Security Hardening & Row Level Security (RLS) Enforcement
-- Revokes open 'anon' access to sensitive internal tables (clients, contacts, projects, tasks, invoices, documents, proposals, activity_log, profiles)
-- Restricts access strictly to authenticated operators, while allowing public read access ONLY to published blog posts.

-- ========================================================
-- 1. BLOG POSTS (Public Read for Published, Authenticated Full Access)
-- ========================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins have full access to blog posts" ON public.blog_posts;

-- Public (anon & authenticated) can only view published blog posts
CREATE POLICY "Public can read published blog posts"
    ON public.blog_posts
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- Authenticated operators have full read/write/update/delete access to blog posts (including drafts)
CREATE POLICY "Authenticated users have full access to blog posts"
    ON public.blog_posts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 2. CLIENTS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Admin full access to clients" ON public.clients;

CREATE POLICY "Authenticated users full access to clients"
    ON public.clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 3. CONTACTS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin full access to contacts" ON public.contacts;

CREATE POLICY "Authenticated users full access to contacts"
    ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 4. PROJECTS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON public.projects;

CREATE POLICY "Authenticated users full access to projects"
    ON public.projects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 5. PROJECT MEMBERS (Authenticated Access Only)
-- ========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_members') THEN
    ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public and authenticated full access to project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Admin full access to project_members" ON public.project_members;
    CREATE POLICY "Authenticated users full access to project_members"
        ON public.project_members
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- ========================================================
-- 6. TASKS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks;

CREATE POLICY "Authenticated users full access to tasks"
    ON public.tasks
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 7. MILESTONES (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admin full access to milestones" ON public.milestones;

CREATE POLICY "Authenticated users full access to milestones"
    ON public.milestones
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 8. INVOICES (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin full access to invoices" ON public.invoices;

CREATE POLICY "Authenticated users full access to invoices"
    ON public.invoices
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 9. INVOICE LINE ITEMS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to invoice_line_items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admin full access to invoice_line_items" ON public.invoice_line_items;

CREATE POLICY "Authenticated users full access to invoice_line_items"
    ON public.invoice_line_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 10. PROPOSALS (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admin full access to proposals" ON public.proposals;

CREATE POLICY "Authenticated users full access to proposals"
    ON public.proposals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 11. ACTIVITY LOG (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Admin full access to activity_log" ON public.activity_log;

CREATE POLICY "Authenticated users full access to activity_log"
    ON public.activity_log
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================================
-- 12. PROFILES (Authenticated Access Only)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own non-role profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins full management of profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- ========================================================
-- 13. DOCUMENTS (Authenticated Access Only)
-- ========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public and authenticated full access to documents" ON public.documents;
    DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;
    CREATE POLICY "Authenticated users full access to documents"
        ON public.documents
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
