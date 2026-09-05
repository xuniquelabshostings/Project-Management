"use client";

import React from "react";
import { useRole } from "@/lib/hooks/useRole";
import { UserRole } from "@/types/database.types";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
  // Single-user workspace: operator has full administrative access across all modules
  return <>{children}</>;
}
