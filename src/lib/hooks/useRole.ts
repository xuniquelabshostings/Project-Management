"use client";

import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/database.types";

export function useRole() {
  const { user, profile, loading, role } = useAuth();

  const userRole: UserRole = (role || profile?.role || "admin") as UserRole;
  const isAuthenticated = Boolean(user);

  const isAdmin = isAuthenticated && (userRole === "admin" || !profile?.role);
  const isAccountManager = isAuthenticated && (isAdmin || userRole === "account_manager");
  const isDeveloper = isAuthenticated && userRole === "developer";

  const hasRole = (allowed: UserRole | UserRole[]) => {
    if (!isAuthenticated) return false;
    const allowedList = Array.isArray(allowed) ? allowed : [allowed];
    return allowedList.includes(userRole) || isAdmin;
  };

  const canAccessFinancials = isAuthenticated && (isAdmin || isAccountManager);
  const canManageTeam = isAuthenticated && isAdmin;
  const canCreateClients = isAuthenticated && (isAdmin || isAccountManager);

  return {
    role: userRole,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isAccountManager,
    isDeveloper,
    hasRole,
    canAccessFinancials,
    canManageTeam,
    canCreateClients,
  };
}
