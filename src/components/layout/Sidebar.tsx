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
  Globe,
  ExternalLink,
  BookOpen,
  CreditCard,
  Layers,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useBranding } from "@/providers/BrandingProvider";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show?: boolean;
}

interface NavCategory {
  category?: string;
  items: NavItem[];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { role } = useRole();
  const { branding } = useBranding();

  const navigationCategories: NavCategory[] = [
    {
      category: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/management",
          icon: LayoutDashboard,
          show: true,
        },
      ],
    },
    {
      category: "Workspace",
      items: [
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
      ],
    },
    {
      category: "Finance & Legal",
      items: [
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
      ],
    },
    {
      category: "Studio & Content",
      items: [
        {
          name: "Blog Posts",
          href: "/blogs",
          icon: BookOpen,
          show: true,
        },
        {
          name: "Case Files",
          href: "/case-files",
          icon: Layers,
          show: true,
        },
        {
          name: "Dev Plans",
          href: "/plans",
          icon: CreditCard,
          show: true,
        },
      ],
    },
    {
      category: "System",
      items: [
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          show: true,
        },
      ],
    },
  ];

  const formatRoleName = (_r?: string | null) => "Administrator";

  const renderNavContent = () => (
    <>
      {/* Brand / Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={branding.logoUrl || "/assets/logo-mark-nobg.png"}
            alt={branding.companyName}
            className="w-8 h-8 rounded-md object-contain border border-border bg-white p-0.5 shrink-0 shadow-xs"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-serif font-semibold text-base text-foreground tracking-tight truncate">
              {branding.companyName}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted truncate">
              {branding.tagline || "Administrator"}
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Close menu"
          >
            <span className="text-xl font-bold leading-none">&times;</span>
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
        {navigationCategories.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.category || sIdx} className="space-y-1">
              {section.category && (
                <div className="px-3 pt-1 pb-0.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted/60 select-none">
                    {section.category}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/management"
                      ? pathname === "/management"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-md text-xs sm:text-sm transition-colors relative ${
                        isActive
                          ? "text-accent font-medium bg-accent-light/50"
                          : "text-muted hover:text-foreground hover:bg-surface-elevated"
                      }`}
                    >
                      {/* Subtle accent indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-accent" />
                      )}
                      <Icon
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="pt-2 mt-2 border-t border-border/40">
          <Link
            href="/"
            target="_blank"
            onClick={onClose}
            className="group flex items-center justify-between px-3 py-2 rounded-md text-xs text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">Visit Live Website</span>
            </div>
            <ExternalLink className="w-3 h-3 text-muted group-hover:text-foreground shrink-0" />
          </Link>
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-border/50 shrink-0">
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
            onClick={() => {
              signOut();
              onClose?.();
            }}
            title="Sign out"
            className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-surface flex-col h-screen select-none shrink-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface shadow-2xl flex flex-col md:hidden transition-transform duration-200 ease-in-out select-none border-r border-border ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {renderNavContent()}
      </aside>
    </>
  );
}
