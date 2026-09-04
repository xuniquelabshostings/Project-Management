"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { AppNotification } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setNotifications(data as AppNotification[]);
    } catch (err) {
      console.warn("Could not load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (link) {
        setShowNotifications(false);
        router.push(link);
      }
    } catch (err) {
      console.warn("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err);
    }
  };

  const getPageTitle = () => {
    if (pathname === "/") return "Overview & Dashboard";
    if (pathname.startsWith("/clients")) return "Clients & Accounts";
    if (pathname.startsWith("/projects")) return "Projects & Milestones";
    if (pathname.startsWith("/tasks")) return "Tasks & Kanban Board";
    if (pathname.startsWith("/invoices")) return "Financials & Invoicing";
    if (pathname.startsWith("/proposals")) return "Proposals & Contracts";
    if (pathname.startsWith("/documents")) return "Document Repository";
    if (pathname.startsWith("/team")) return "Team & User Access";
    if (pathname.startsWith("/settings")) return "Account Settings";
    return "Workspace";
  };

  const getRoleBadgeVariant = (userRole?: string | null) => {
    switch (userRole) {
      case "admin":
        return "danger";
      case "account_manager":
        return "warning";
      case "developer":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <header className="h-16 border-b border-border/50 bg-surface/80 backdrop-blur-xs px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="font-serif text-lg font-semibold text-foreground tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        {role && (
          <Badge variant={getRoleBadgeVariant(role)} className="capitalize text-[11px] font-mono">
            {role.replace("_", " ")}
          </Badge>
        )}

        {/* Notification bell dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-elevated transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-surface p-3 shadow-lg z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2">
                <span className="font-semibold text-foreground">
                  Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-accent hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 py-1 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={`p-2.5 rounded-md border cursor-pointer transition-colors ${
                        n.read
                          ? "bg-surface-elevated/40 border-border/40 text-muted"
                          : "bg-accent-light/40 border-accent/30 text-foreground font-medium"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs">{n.title}</p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
