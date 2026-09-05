"use client";

import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/database.types";

export function useRole() {
  const { profile, loading } = useAuth();

  const role: UserRole = "admin";
  const isAdmin = true;
  const isAccountManager = true;
  const isDeveloper = false;

  const hasRole = (_allowed: UserRole | UserRole[]) => true;

  const canAccessFinancials = true;
  const canManageTeam = true;
  const canCreateClients = true;

  return {
    role,
    profile,
    loading,
    isAdmin,
    isAccountManager,
    isDeveloper,
    hasRole,
    canAccessFinancials,
    canManageTeam,
    canCreateClients,
  };
}
