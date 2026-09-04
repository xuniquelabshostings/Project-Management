-- 001_profiles_and_roles.sql
-- Foundational Auth & Profiles Migration with strict Row Level Security (RLS)

-- 1. Create role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'account_manager', 'developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role user_role NOT NULL DEFAULT 'developer',
    avatar_url TEXT,
    phone TEXT,
    theme_preference TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Helper functions to check role in RLS without recursion
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_account_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. RLS Policies for Profiles
-- A) SELECT: Any authenticated internal user can view team member profiles (assignees, mentions, team lists)
CREATE POLICY "Authenticated users can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- B) UPDATE: Users can update their own profile (name, avatar, theme)
-- Notice: Prevent privilege escalation by ensuring non-admins cannot change their own role
CREATE POLICY "Users can update their own non-role profile fields"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            -- Either user is admin, or their role remains unchanged
            public.is_admin() OR role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        )
    );

-- C) ADMIN: Admins can update any profile (including changing roles)
CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- D) ADMIN: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. Trigger to automatically create a profile when a new user is invited/created in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_count integer;
    assigned_role user_role;
BEGIN
    -- If this is the very first user in the system, automatically make them admin
    SELECT count(*) INTO user_count FROM public.profiles;
    IF user_count = 0 THEN
        assigned_role := 'admin'::user_role;
    ELSE
        -- Respect raw_user_meta_data->>'role' if passed during admin invite, else default to developer
        assigned_role := COALESCE(
            (new.raw_user_meta_data->>'role')::user_role,
            'developer'::user_role
        );
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        assigned_role
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
