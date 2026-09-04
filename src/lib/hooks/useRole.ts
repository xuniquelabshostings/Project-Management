"use client";

import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/database.types";

export function useRole() {
  const { role, profile, loading } = useAuth();

  const isAdmin = role === "admin";
  const isAccountManager = role === "account_manager";
  const isDeveloper = role === "developer";

  const hasRole = (allowed: UserRole | UserRole[]) => {
    if (!role) return false;
    if (Array.isArray(allowed)) {
      return allowed.includes(role);
    }
    return role === allowed;
  };

  const canAccessFinancials = isAdmin || isAccountManager;
  const canManageTeam = isAdmin;
  const canCreateClients = isAdmin || isAccountManager;

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
