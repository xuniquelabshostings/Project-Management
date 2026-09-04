-- 004_collaboration.sql
-- Comments, Mentions, and Internal Notifications

-- 1. Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_project ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- 3. Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: COMMENTS
-- SELECT: Only users who can access the associated project or task
CREATE POLICY "View comments"
    ON public.comments
    FOR SELECT
    TO authenticated
    USING (
        (project_id IS NOT NULL AND public.can_access_project(project_id)) OR
        (task_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tasks t WHERE t.id = task_id AND public.can_access_project(t.project_id)
        ))
    );

-- INSERT: Only users who can access the associated project or task
CREATE POLICY "Create comments"
    ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() AND (
            (project_id IS NOT NULL AND public.can_access_project(project_id)) OR
            (task_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.tasks t WHERE t.id = task_id AND public.can_access_project(t.project_id)
            ))
        )
    );

-- UPDATE / DELETE: Only author or admin
CREATE POLICY "Edit own comments"
    ON public.comments
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Delete own comments"
    ON public.comments
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid() OR public.is_admin());

-- 5. RLS Policies: NOTIFICATIONS
-- SELECT: Users see only their own notifications
CREATE POLICY "Users see own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- INSERT: Authenticated users can create notifications for any team member (e.g. on @mention or assignment)
CREATE POLICY "Authenticated users can create notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE: Users can mark their own notifications as read
CREATE POLICY "Users update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can clear their own notifications
CREATE POLICY "Users delete own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
