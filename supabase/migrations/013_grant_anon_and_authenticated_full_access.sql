-- 013_grant_anon_and_authenticated_full_access.sql
-- Grants unconditional full read/write access to both anon and authenticated roles
-- ensuring the single-user dashboard persists actual data to cloud database even before session sign-in.

-- 1. Clients
DROP POLICY IF EXISTS "Admin full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Public and authenticated full access to clients" ON public.clients;

CREATE POLICY "Public and authenticated full access to clients"
    ON public.clients
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Contacts
DROP POLICY IF EXISTS "Admin full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public and authenticated full access to contacts" ON public.contacts;

CREATE POLICY "Public and authenticated full access to contacts"
    ON public.contacts
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Projects
DROP POLICY IF EXISTS "Admin full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Public and authenticated full access to projects" ON public.projects;

CREATE POLICY "Public and authenticated full access to projects"
    ON public.projects
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Project Members
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_members') THEN
    DROP POLICY IF EXISTS "Admin full access to project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Public and authenticated full access to project_members" ON public.project_members;
    CREATE POLICY "Public and authenticated full access to project_members"
        ON public.project_members
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- 5. Tasks
DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Public and authenticated full access to tasks" ON public.tasks;

CREATE POLICY "Public and authenticated full access to tasks"
    ON public.tasks
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Milestones
DROP POLICY IF EXISTS "Admin full access to milestones" ON public.milestones;
DROP POLICY IF EXISTS "Public and authenticated full access to milestones" ON public.milestones;

CREATE POLICY "Public and authenticated full access to milestones"
    ON public.milestones
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Invoices
DROP POLICY IF EXISTS "Admin full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public and authenticated full access to invoices" ON public.invoices;

CREATE POLICY "Public and authenticated full access to invoices"
    ON public.invoices
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Invoice Line Items
DROP POLICY IF EXISTS "Admin full access to invoice_line_items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Public and authenticated full access to invoice_line_items" ON public.invoice_line_items;

CREATE POLICY "Public and authenticated full access to invoice_line_items"
    ON public.invoice_line_items
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Activity Log
DROP POLICY IF EXISTS "Admin full access to activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Public and authenticated full access to activity_log" ON public.activity_log;

CREATE POLICY "Public and authenticated full access to activity_log"
    ON public.activity_log
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 10. Proposals
DROP POLICY IF EXISTS "Admin full access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Public and authenticated full access to proposals" ON public.proposals;

CREATE POLICY "Public and authenticated full access to proposals"
    ON public.proposals
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 11. Documents
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;
    DROP POLICY IF EXISTS "Public and authenticated full access to documents" ON public.documents;
    CREATE POLICY "Public and authenticated full access to documents"
        ON public.documents
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- 12. Profiles
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public and authenticated full access to profiles" ON public.profiles;

CREATE POLICY "Public and authenticated full access to profiles"
    ON public.profiles
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 13. Blog Posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
    DROP POLICY IF EXISTS "Public and authenticated full access to blog_posts" ON public.blog_posts;
    CREATE POLICY "Public and authenticated full access to blog_posts"
        ON public.blog_posts
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;
