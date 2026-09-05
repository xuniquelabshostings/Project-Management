"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/types/database.types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInAsDemo: (role: UserRole) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = "xunique_demo_session_role";

const DEMO_PROFILES: Record<UserRole, Profile> = {
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@xuniquelabs.com",
    full_name: "Marcus Vance",
    role: "admin",
    avatar_url: null,
    phone: "+1 (555) 019-2831",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  account_manager: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "alex.am@xuniquelabs.com",
    full_name: "Alex Morgan",
    role: "account_manager",
    avatar_url: null,
    phone: "+1 (555) 019-4829",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  developer: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "sarah.dev@xuniquelabs.com",
    full_name: "Sarah Chen",
    role: "developer",
    avatar_url: null,
    phone: "+1 (555) 019-9921",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return null;
      }
      return { ...(data as Profile), role: "admin" as UserRole };
    } catch (err) {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // Check for local demo session first
        const demoRole = localStorage.getItem(DEMO_STORAGE_KEY) as UserRole | null;
        if (demoRole && DEMO_PROFILES[demoRole]) {
          const demoProf = DEMO_PROFILES[demoRole];
          const mockUser = {
            id: demoProf.id,
            email: demoProf.email,
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: { full_name: demoProf.full_name },
            created_at: demoProf.created_at,
          } as unknown as User;

          if (mounted) {
            setUser(mockUser);
            setProfile(demoProf);
            setLoading(false);
          }
          return;
        }

        // Otherwise check live Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const prof = await fetchProfile(session.user.id);
          if (mounted) setProfile(prof);
        }
      } catch (e) {
        // network or initialization fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        const demoRole = localStorage.getItem(DEMO_STORAGE_KEY);
        if (demoRole) return; // ignore if running in demo mode

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const prof = await fetchProfile(newSession.user.id);
          if (mounted) setProfile(prof);
        } else {
          if (mounted) setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        setProfile(prof);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInAsDemo = (demoRole: UserRole) => {
    const demoProf = DEMO_PROFILES[demoRole];
    const mockUser = {
      id: demoProf.id,
      email: demoProf.email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { full_name: demoProf.full_name },
      created_at: demoProf.created_at,
    } as unknown as User;

    localStorage.setItem(DEMO_STORAGE_KEY, demoRole);
    setUser(mockUser);
    setProfile(demoProf);
    setSession(null);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: "admin",
        loading,
        signIn,
        signInAsDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
