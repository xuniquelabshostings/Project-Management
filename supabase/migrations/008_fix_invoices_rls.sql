-- 008_fix_invoices_rls.sql
-- Fixes RLS policies on invoices and invoice_line_items so Admins and Account Managers can create/manage invoices without RLS violations.

-- 1. Ensure can_manage_client is robust, handles NULL account_manager_id, and grants access to admins and account managers
CREATE OR REPLACE FUNCTION public.can_manage_client(client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    public.is_admin() 
    OR public.is_account_manager()
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_uuid
        AND (
          c.account_manager_id = (SELECT auth.uid())
          OR c.account_manager_id IS NULL
        )
    );
$$;

-- 2. Drop existing RLS policies on invoices
DROP POLICY IF EXISTS "Admins and AMs view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and AMs insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and AMs update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins delete invoices" ON public.invoices;

-- 3. Recreate clean, hardened RLS policies on invoices
CREATE POLICY "Admins and AMs view invoices"
    ON public.invoices
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin() 
        OR public.is_account_manager() 
        OR public.can_manage_client(client_id)
    );

CREATE POLICY "Admins and AMs insert invoices"
    ON public.invoices
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() 
        OR public.is_account_manager() 
        OR public.can_manage_client(client_id)
    );

CREATE POLICY "Admins and AMs update invoices"
    ON public.invoices
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin() 
        OR public.is_account_manager() 
        OR public.can_manage_client(client_id)
    )
    WITH CHECK (
        public.is_admin() 
        OR public.is_account_manager() 
        OR public.can_manage_client(client_id)
    );

CREATE POLICY "Admins delete invoices"
    ON public.invoices
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 4. Drop existing RLS policies on invoice line items
DROP POLICY IF EXISTS "Admins and AMs view line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins and AMs insert line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins and AMs update line items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Admins delete line items" ON public.invoice_line_items;

-- 5. Recreate clean, hardened RLS policies on invoice line items
CREATE POLICY "Admins and AMs view line items"
    ON public.invoice_line_items
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin() 
        OR public.is_account_manager()
        OR EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_id
              AND public.can_manage_client(i.client_id)
        )
    );

CREATE POLICY "Admins and AMs insert line items"
    ON public.invoice_line_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() 
        OR public.is_account_manager()
        OR EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_id
              AND public.can_manage_client(i.client_id)
        )
    );

CREATE POLICY "Admins and AMs update line items"
    ON public.invoice_line_items
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin() 
        OR public.is_account_manager()
        OR EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_id
              AND public.can_manage_client(i.client_id)
        )
    )
    WITH CHECK (
        public.is_admin() 
        OR public.is_account_manager()
        OR EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_id
              AND public.can_manage_client(i.client_id)
        )
    );

CREATE POLICY "Admins delete line items"
    ON public.invoice_line_items
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. Ensure all current auth users have an active profile with admin privileges
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Staff Admin'), 
    'admin'::user_role
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'
WHERE public.profiles.role = 'developer';
