-- 007_fix_rls_and_admin_access.sql
-- Fixes and hardens RLS policies for clients table and syncs admin role

-- 1. Ensure helper functions use cached subqueries and clean search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_account_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'account_manager')
  );
$$;

-- 2. Drop existing clients policies to replace them with corrected predicates
DROP POLICY IF EXISTS "Admins have full read access to clients" ON public.clients;
DROP POLICY IF EXISTS "Account Managers can view their assigned clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and Account Managers can create clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Account Managers can update their assigned clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;

-- 3. Re-create robust RLS policies for clients
-- SELECT: Admins see all; Account Managers see assigned and unassigned clients
CREATE POLICY "Admins and Account Managers can read clients"
    ON public.clients
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR (
            public.is_account_manager() AND (
                account_manager_id = (SELECT auth.uid()) OR account_manager_id IS NULL
            )
        )
    );

-- INSERT: Admins can create any client; Account Managers can create client assigned to them or unassigned
CREATE POLICY "Admins and Account Managers can create clients"
    ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() OR (
            public.is_account_manager() AND (
                account_manager_id = (SELECT auth.uid()) OR account_manager_id IS NULL
            )
        )
    );

-- UPDATE: Admins can update all; Account Managers can update their assigned or unassigned
CREATE POLICY "Admins and Account Managers can update clients"
    ON public.clients
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin() OR (
            public.is_account_manager() AND (
                account_manager_id = (SELECT auth.uid()) OR account_manager_id IS NULL
            )
        )
    )
    WITH CHECK (
        public.is_admin() OR (
            public.is_account_manager() AND (
                account_manager_id = (SELECT auth.uid()) OR account_manager_id IS NULL
            )
        )
    );

-- DELETE: Only Admins can delete clients
CREATE POLICY "Only admins can delete clients"
    ON public.clients
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 4. Sync all existing auth users into public.profiles as 'admin'
-- This immediately ensures your Supabase user account has full admin RLS permissions
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Admin'), 
    'admin'::user_role
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'
WHERE public.profiles.role != 'admin';
