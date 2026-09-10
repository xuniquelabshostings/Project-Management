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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId?: string): Promise<Profile | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        return data as Profile;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const prof = await fetchProfile(user.id);
    if (prof) {
      setProfile(prof);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (mounted && prof) {
            setProfile(prof);
          } else if (mounted) {
            // Construct a basic profile from session metadata
            setProfile({
              id: session.user.id,
              email: session.user.email || "",
              full_name: (session.user.user_metadata?.full_name as string) || (session.user.email ? session.user.email.split("@")[0] : "Admin"),
              role: (session.user.user_metadata?.role as UserRole) || "admin",
              avatar_url: null,
              phone: null,
              theme_preference: "system",
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          const prof = await fetchProfile(newSession.user.id);
          if (mounted && prof) {
            setProfile(prof);
          } else if (mounted) {
            setProfile({
              id: newSession.user.id,
              email: newSession.user.email || "",
              full_name: (newSession.user.user_metadata?.full_name as string) || (newSession.user.email ? newSession.user.email.split("@")[0] : "Admin"),
              role: (newSession.user.user_metadata?.role as UserRole) || "admin",
              avatar_url: null,
              phone: null,
              theme_preference: "system",
              created_at: newSession.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        if (prof) {
          setProfile(prof);
        } else {
          setProfile({
            id: data.user.id,
            email: data.user.email || "",
            full_name: (data.user.user_metadata?.full_name as string) || (data.user.email ? data.user.email.split("@")[0] : "Admin"),
            role: (data.user.user_metadata?.role as UserRole) || "admin",
            avatar_url: null,
            phone: null,
            theme_preference: "system",
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInAsDemo = async (role: UserRole = "admin") => {
    // Demonstration / Local preview mode helper with clearly isolated mock state
    const demoId = "demo-admin-user";
    const demoUser = {
      id: demoId,
      email: "admin@xuniquelabs.com",
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { full_name: "Demo Administrator", role },
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(demoUser);
    setProfile({
      id: demoId,
      email: "admin@xuniquelabs.com",
      full_name: "Demo Administrator",
      role,
      avatar_url: null,
      phone: null,
      theme_preference: "system",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setSession(null);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const currentRole: UserRole | null = profile?.role || (user ? "admin" : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: currentRole,
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
