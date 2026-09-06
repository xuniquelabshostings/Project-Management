"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Globe,
  Server,
  FileText,
  CheckSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  MessageCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import {
  UnifiedAlert,
  AlertCategory,
  fetchUnifiedAlerts,
  saveLocalReadAlertId,
  saveLocalReadAllAlertIds,
} from "@/lib/notifications";
import { sendClientWhatsAppRenewalAlert } from "@/lib/renewal-alert";
import { formatINR } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  const [activeTab, setActiveTab] = useState<AlertCategory>("all");
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertingId, setAlertingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load unified alerts
  const loadAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const data = await fetchUnifiedAlerts(user?.id);
      setAlerts(data);
    } catch (err) {
      console.warn("Could not load alerts:", err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Poll alerts every 2 minutes
    const interval = setInterval(loadAlerts, 120000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => !a.read && a.severity === "critical").length;

  const infraCount = alerts.filter((a) => a.category === "infrastructure").length;
  const invoiceCount = alerts.filter((a) => a.category === "invoices").length;
  const taskCount = alerts.filter((a) => a.category === "tasks").length;
  const generalCount = alerts.filter((a) => a.category === "general").length;

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === "all") return true;
    return a.category === activeTab;
  });

  const handleMarkAsRead = (alertId: string, link?: string) => {
    saveLocalReadAlertId(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
    if (link) {
      setShowNotifications(false);
      router.push(link);
    }
  };

  const handleMarkAllRead = () => {
    saveLocalReadAllAlertIds(alerts.map((a) => a.id));
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleTriggerWhatsApp = async (
    e: React.MouseEvent,
    alert: UnifiedAlert
  ) => {
    e.stopPropagation();
    if (!alert.client) return;

    setAlertingId(alert.id);
    try {
      await sendClientWhatsAppRenewalAlert(
        alert.client,
        alert.client.contacts,
        true
      );
      // Automatically mark as read once alert is sent
      handleMarkAsRead(alert.id);
    } catch (err) {
      console.error("WhatsApp alert failed:", err);
    } finally {
      setAlertingId(null);
    }
  };

  const getPageTitle = () => {
    if (pathname === "/management" || pathname === "/") return "Overview & Dashboard";
    if (pathname.startsWith("/clients")) return "Clients & Accounts";
    if (pathname.startsWith("/projects")) return "Projects & Milestones";
    if (pathname.startsWith("/tasks")) return "Tasks & Kanban Board";
    if (pathname.startsWith("/invoices")) return "Financials & Invoicing";
    if (pathname.startsWith("/proposals")) return "Proposals & Contracts";
    if (pathname.startsWith("/agreements")) return "Agreements & Contracts";
    if (pathname.startsWith("/documents")) return "Document Repository";
    if (pathname.startsWith("/blogs")) return "Blog & Content Engine";
    if (pathname.startsWith("/team")) return "Team & User Access";
    if (pathname.startsWith("/settings")) return "Account Settings";
    return "Workspace";
  };

  const renderAlertIcon = (alert: UnifiedAlert) => {
    if (alert.subType === "domain") {
      return (
        <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4" />
        </div>
      );
    }
    if (alert.subType === "hosting") {
      return (
        <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
          <Server className="w-4 h-4" />
        </div>
      );
    }
    if (alert.category === "invoices") {
      return (
        <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (alert.category === "tasks") {
      return (
        <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <CheckSquare className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-md bg-muted/20 text-muted flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4" />
      </div>
    );
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
        <Badge variant="danger" className="uppercase text-[10px] font-mono tracking-wider font-semibold">
          Admin
        </Badge>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors relative ${
              showNotifications
                ? "border-accent bg-surface-elevated text-foreground"
                : "border-border bg-surface text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
            title="Notification & Renewal Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                    criticalCount > 0 ? "bg-danger" : "bg-accent"
                  }`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
                {criticalCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-danger animate-ping opacity-75 pointer-events-none" />
                )}
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[380px] sm:w-[440px] rounded-lg border border-border bg-surface shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 border-b border-border/60 bg-surface-elevated/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    Notifications & Alerts
                  </span>
                  {unreadCount > 0 && (
                    <Badge variant={criticalCount > 0 ? "danger" : "warning"} className="text-[10px] py-0 px-1.5 font-mono">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAlerts}
                    disabled={isLoadingAlerts}
                    className="p-1 rounded text-muted hover:text-foreground hover:bg-surface transition-colors"
                    title="Refresh alerts"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlerts ? "animate-spin" : ""}`} />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-2 bg-surface border-b border-border/40 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
                    activeTab === "all"
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  All ({alerts.length})
                </button>
                <button
                  onClick={() => setActiveTab("infrastructure")}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium flex items-center gap-1 ${
                    activeTab === "infrastructure"
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <span>⚡ Infra</span>
                  <span className="opacity-75">({infraCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium flex items-center gap-1 ${
                    activeTab === "invoices"
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <span>₹ Invoices</span>
                  <span className="opacity-75">({invoiceCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium flex items-center gap-1 ${
                    activeTab === "tasks"
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <span>✓ Tasks</span>
                  <span className="opacity-75">({taskCount})</span>
                </button>
                {generalCount > 0 && (
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium flex items-center gap-1 ${
                      activeTab === "general"
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted hover:text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    <span>System</span>
                    <span className="opacity-75">({generalCount})</span>
                  </button>
                )}
              </div>

              {/* Alert List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30 p-1.5 space-y-1">
                {filteredAlerts.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-success" />
                    <p className="text-xs font-medium text-foreground">All clear!</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      No active alerts in this category.
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isOverdue =
                      alert.metadata?.daysLeft != null &&
                      alert.metadata.daysLeft < 0;

                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleMarkAsRead(alert.id, alert.link)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                          alert.read
                            ? "bg-surface-elevated/30 border-transparent hover:border-border/60 hover:bg-surface-elevated/60 opacity-80"
                            : alert.severity === "critical"
                            ? "bg-danger-bg/40 border-danger/30 hover:border-danger/60"
                            : alert.severity === "warning"
                            ? "bg-warning-bg/40 border-warning/30 hover:border-warning/60"
                            : "bg-surface-elevated/70 border-border hover:border-accent/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {renderAlertIcon(alert)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-semibold tracking-tight ${
                                    alert.read
                                      ? "text-muted"
                                      : alert.severity === "critical"
                                      ? "text-danger"
                                      : "text-foreground"
                                  }`}
                                >
                                  {alert.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {alert.severity === "critical" ? (
                                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/20 flex items-center gap-0.5">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    Critical
                                  </span>
                                ) : alert.severity === "warning" ? (
                                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Warning
                                  </span>
                                ) : null}

                                {!alert.read && (
                                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-muted leading-relaxed mb-2">
                              {alert.message}
                            </p>

                            {/* Metadata & Actions */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20">
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                                {alert.metadata?.daysLeft != null && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-medium ${
                                      isOverdue
                                        ? "bg-danger/10 text-danger font-semibold"
                                        : alert.metadata.daysLeft <= 7
                                        ? "bg-warning/15 text-warning font-semibold"
                                        : "bg-surface-elevated text-muted"
                                    }`}
                                  >
                                    {isOverdue
                                      ? `Expired ${Math.abs(alert.metadata.daysLeft)}d ago`
                                      : alert.metadata.daysLeft === 0
                                      ? "Due Today"
                                      : `${alert.metadata.daysLeft}d left`}
                                  </span>
                                )}

                                {alert.metadata?.amount != null && (
                                  <span className="px-1.5 py-0.5 rounded bg-surface-elevated text-foreground font-semibold">
                                    {formatINR(alert.metadata.amount)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* 1-Click WhatsApp Renewal Alert */}
                                {alert.category === "infrastructure" && alert.client && (
                                  <button
                                    onClick={(e) => handleTriggerWhatsApp(e, alert)}
                                    disabled={alertingId === alert.id}
                                    className="px-2 py-1 rounded bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                    title="Fetch WHOIS & send WhatsApp alert directly"
                                  >
                                    {alertingId === alert.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <MessageCircle className="w-3 h-3" />
                                    )}
                                    <span>WhatsApp Alert</span>
                                  </button>
                                )}

                                {alert.link && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(alert.id, alert.link);
                                    }}
                                    className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                                    title="View details"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}

                                {!alert.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(alert.id);
                                    }}
                                    className="p-1 rounded text-muted hover:text-accent hover:bg-surface-elevated transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2 border-t border-border/40 bg-surface-elevated/40 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/management");
                  }}
                  className="text-[11px] text-accent hover:underline font-medium"
                >
                  View Full Operations Dashboard →
                </button>
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
