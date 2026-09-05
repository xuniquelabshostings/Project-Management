"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Receipt,
  FileText,
  FileSignature,
  FolderOpen,
  UserCheck,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useBranding } from "@/providers/BrandingProvider";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { role } = useRole();
  const { branding } = useBranding();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
      show: true,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Briefcase,
      show: true,
    },
    {
      name: "Tasks & Board",
      href: "/tasks",
      icon: CheckSquare,
      show: true,
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: Receipt,
      show: true,
    },
    {
      name: "Proposals",
      href: "/proposals",
      icon: FileText,
      show: true,
    },
    {
      name: "Agreements",
      href: "/agreements",
      icon: FileSignature,
      show: true,
    },
    {
      name: "Documents",
      href: "/documents",
      icon: FolderOpen,
      show: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      show: true,
    },
  ];

  const formatRoleName = (_r?: string | null) => "Administrator";

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-screen select-none shrink-0">
      {/* Brand / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 gap-3">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.companyName}
            className="w-8 h-8 rounded-md object-contain border border-border bg-white p-0.5 shrink-0 shadow-xs"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white shadow-xs shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="font-serif font-semibold text-base text-foreground tracking-tight truncate">
            {branding.companyName}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted truncate">
            {branding.tagline || "Administrator"}
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation
          .filter((item) => item.show)
          .map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative ${
                  isActive
                    ? "text-accent font-medium bg-accent-light/50"
                    : "text-muted hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {/* Subtle terracotta accent indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-accent" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-elevated transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs font-medium text-foreground shrink-0 uppercase">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </span>
              <span className="text-[10px] text-muted truncate">
                {formatRoleName(role)}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
