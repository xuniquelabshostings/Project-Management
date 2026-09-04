-- 005_documents.sql
-- Client and Project Document Metadata and Storage Integration with RLS

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    version INTEGER NOT NULL DEFAULT 1,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Document access policy"
    ON public.documents
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR
        (public.is_account_manager() AND public.can_manage_client(client_id)) OR
        (
            NOT is_sensitive AND
            project_id IS NOT NULL AND
            public.can_access_project(project_id)
        )
    );

-- INSERT
CREATE POLICY "Document upload policy"
    ON public.documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() OR
        (public.is_account_manager() AND public.can_manage_client(client_id)) OR
        (
            project_id IS NOT NULL AND
            public.can_access_project(project_id) AND
            uploaded_by = auth.uid()
        )
    );

-- UPDATE
CREATE POLICY "Document update policy"
    ON public.documents
    FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR (public.is_account_manager() AND public.can_manage_client(client_id)));

-- DELETE
CREATE POLICY "Document delete policy"
    ON public.documents
    FOR DELETE
    TO authenticated
    USING (public.is_admin() OR (public.is_account_manager() AND public.can_manage_client(client_id)));
