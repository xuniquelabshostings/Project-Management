-- 003_projects_and_tasks.sql
-- Projects, Kanban Tasks, Milestones, and Assignments with RLS policies

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_member_role AS ENUM ('lead', 'contributor', 'reviewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12, 2),
    status project_status NOT NULL DEFAULT 'planning',
    kanban_columns TEXT[] NOT NULL DEFAULT ARRAY['To Do', 'In Progress', 'Review', 'Done'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- 3. Project members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_role project_member_role NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);

-- 4. Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);

-- 5. Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    kanban_column TEXT NOT NULL DEFAULT 'To Do',
    column_order INTEGER NOT NULL DEFAULT 0,
    due_date DATE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON public.tasks(project_id, kanban_column);

-- 6. Task assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON public.task_assignments(user_id);

-- 7. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- 8. Helper functions for project-level RLS
CREATE OR REPLACE FUNCTION public.can_access_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_uuid AND (
      public.is_admin() OR
      (public.is_account_manager() AND public.can_manage_client(p.client_id)) OR
      EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = project_uuid AND pm.user_id = auth.uid()
      )
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_manage_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_uuid AND (
      public.is_admin() OR
      (public.is_account_manager() AND public.can_manage_client(p.client_id))
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 9. RLS Policies: PROJECTS
-- SELECT: Admins, AMs of the client, or assigned team members
CREATE POLICY "Read access to projects based on assignment or role"
    ON public.projects
    FOR SELECT
    TO authenticated
    USING (public.can_access_project(id));

-- INSERT: Admins or AMs managing the client
CREATE POLICY "Admins and AMs can create projects"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_client(client_id));

-- UPDATE: Admins or AMs managing the client
CREATE POLICY "Admins and AMs can update projects"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_client(client_id))
    WITH CHECK (public.can_manage_client(client_id));

-- DELETE: Admins only
CREATE POLICY "Only admins can delete projects"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 10. RLS Policies: PROJECT_MEMBERS
CREATE POLICY "View project members for accessible projects"
    ON public.project_members
    FOR SELECT
    TO authenticated
    USING (public.can_access_project(project_id));

CREATE POLICY "Manage project members"
    ON public.project_members
    FOR ALL
    TO authenticated
    USING (public.can_manage_project(project_id))
    WITH CHECK (public.can_manage_project(project_id));


-- 11. RLS Policies: MILESTONES
CREATE POLICY "View milestones for accessible projects"
    ON public.milestones
    FOR SELECT
    TO authenticated
    USING (public.can_access_project(project_id));

CREATE POLICY "Manage milestones for authorized roles"
    ON public.milestones
    FOR ALL
    TO authenticated
    USING (public.can_manage_project(project_id))
    WITH CHECK (public.can_manage_project(project_id));


-- 12. RLS Policies: TASKS
-- SELECT: Anyone with access to the project
CREATE POLICY "View tasks for accessible projects"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (public.can_access_project(project_id));

-- INSERT: Project managers, or assigned members
CREATE POLICY "Create tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_access_project(project_id));

-- UPDATE: Project managers, or assigned developers (to move columns/update status)
CREATE POLICY "Update tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (public.can_access_project(project_id))
    WITH CHECK (public.can_access_project(project_id));

-- DELETE: Admins and AMs managing the project
CREATE POLICY "Delete tasks"
    ON public.tasks
    FOR DELETE
    TO authenticated
    USING (public.can_manage_project(project_id));


-- 13. RLS Policies: TASK_ASSIGNMENTS
CREATE POLICY "View task assignments"
    ON public.task_assignments
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id AND public.can_access_project(t.project_id)
      )
    );

CREATE POLICY "Manage task assignments"
    ON public.task_assignments
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id AND public.can_access_project(t.project_id)
      )
    );
