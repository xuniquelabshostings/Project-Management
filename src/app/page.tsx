"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckSquare,
  Receipt,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  Shield,
  Activity,
  Plus,
  TrendingUp,
  AlertCircle,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { supabase } from "@/lib/supabase/client";
import { Client, Project, Task, Invoice, ActivityLogEntry } from "@/types/database.types";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { role, isAdmin, isAccountManager, isDeveloper } = useRole();

  const [clientsCount, setClientsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [pipelineValue, setPipelineValue] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityLogEntry[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);

        if (isAdmin || isAccountManager) {
          const { count: cCount } = await supabase
            .from("clients")
            .select("*", { count: "exact", head: true });
          if (cCount !== null) setClientsCount(cCount);

          const { data: leadProjects } = await supabase
            .from("projects")
            .select("budget, status")
            .in("status", ["planning"]);

          if (leadProjects) {
            const sum = (leadProjects as Array<{ budget: number | null }>).reduce(
              (acc, p) => acc + (p.budget || 0),
              0
            );
            setPipelineValue(sum);
          }

          const { data: overdue } = await supabase
            .from("invoices")
            .select("*, client:clients(*)")
            .eq("status", "overdue")
            .limit(4);
          if (overdue) setOverdueInvoices(overdue as Invoice[]);

          const { data: acts } = await supabase
            .from("activity_log")
            .select("*, author:profiles(*)")
            .order("occurred_at", { ascending: false })
            .limit(5);
          if (acts) setRecentActivities(acts as ActivityLogEntry[]);
        }

        const { count: pCount } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        if (pCount !== null) setProjectsCount(pCount);

        const { data: tasks, count: tCount } = await supabase
          .from("tasks")
          .select("*, project:projects(*)", { count: "exact" })
          .order("due_date", { ascending: true })
          .limit(5);

        if (tCount !== null) setTasksCount(tCount);
        if (tasks) setUpcomingTasks(tasks as Task[]);
      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [isAdmin, isAccountManager]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Team Member"}
            </h1>
            <p className="text-sm text-muted mt-1">
              Internal coordination & client management hub &bull; Role:{" "}
              <span className="font-mono text-foreground capitalize">
                {role?.replace("_", " ") || "Authenticating"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(isAdmin || isAccountManager) && (
              <>
                <Link href="/clients">
                  <Button variant="outline" size="sm">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Clients
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="primary" size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    New Project
                  </Button>
                </Link>
              </>
            )}
            {isDeveloper && (
              <Link href="/tasks">
                <Button variant="primary" size="sm">
                  <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                  My Kanban Board
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin || isAccountManager ? (
            <>
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Active Clients
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {clientsCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-accent-light text-accent flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Active Projects
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {projectsCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-success-bg text-success flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Pipeline Value
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {formatCurrency(pipelineValue)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-warning-bg text-warning flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Overdue Invoices
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {overdueInvoices.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-danger-bg text-danger flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      My Tasks
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {tasksCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-accent-light text-accent flex items-center justify-center">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Assigned Projects
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {projectsCount}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-info-bg text-info flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Upcoming Deadlines
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {upcomingTasks.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-warning-bg text-warning flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Workspace Status
                    </p>
                    <h3 className="font-sans text-sm font-semibold text-foreground mt-1">
                      Active Access
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-success-bg text-success flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Revenue Trends Chart (Admin & AM) */}
        {(isAdmin || isAccountManager) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Revenue Trends & Invoicing Trajectory
                </CardTitle>
                <p className="text-xs text-muted mt-1">
                  Monthly invoiced and settled revenue across agency projects
                </p>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View Financials <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <RevenueChart data={[]} />
            </CardContent>
          </Card>
        )}

        {/* Overdue Invoices Alert Section (Admin & AM) */}
        {(isAdmin || isAccountManager) && overdueInvoices.length > 0 && (
          <Card className="border-danger/30 bg-danger-bg/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle className="w-4 h-4" />
                <CardTitle className="text-sm text-danger font-semibold">
                  Overdue Invoices Action Required ({overdueInvoices.length})
                </CardTitle>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-xs text-danger hover:text-danger">
                  All Invoices &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="divide-y divide-danger/20">
                {overdueInvoices.map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-semibold text-foreground">
                        {inv.invoice_number}
                      </span>
                      <span className="text-muted ml-2">&bull; {inv.client?.company_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-danger font-mono font-bold">
                        ${Number(inv.total_amount).toLocaleString()}
                      </span>
                      <span className="text-muted font-mono text-[11px]">
                        Due: {new Date(inv.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two-Column Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main: Tasks / Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Upcoming Deadlines & Action Items</CardTitle>
                  <p className="text-xs text-muted mt-1">
                    Prioritized across active project boards
                  </p>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View Board <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No pending deadlines found.</p>
                    <p className="text-xs text-muted mt-1">
                      Tasks assigned to your projects will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {upcomingTasks.map((t) => (
                      <div
                        key={t.id}
                        className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {t.project && (
                              <span className="text-xs text-accent font-medium">
                                {t.project.name}
                              </span>
                            )}
                            <span className="text-muted/40">&bull;</span>
                            <span className="text-xs text-muted">
                              Column: {t.kanban_column}
                            </span>
                            {t.due_date && (
                              <>
                                <span className="text-muted/40">&bull;</span>
                                <span className="text-xs text-muted flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3" />
                                  {t.due_date}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            t.priority === "urgent"
                              ? "danger"
                              : t.priority === "high"
                              ? "warning"
                              : "secondary"
                          }
                          className="capitalize text-[11px]"
                        >
                          {t.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>

          {/* Right Column: Activity Feed or Quick Nav */}
          <div className="space-y-6">
            {(isAdmin || isAccountManager) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Client Activity Log</CardTitle>
                    <p className="text-xs text-muted mt-1">Recent communications</p>
                  </div>
                  <Link href="/clients">
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      All <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-6 text-muted">
                      <Activity className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No client activities logged yet.</p>
                      <p className="text-[11px] text-muted mt-1">
                        Use the Clients tab to record calls, meetings, and WhatsApp summaries.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-md bg-surface-elevated text-xs border border-border/40"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {act.type}
                            </Badge>
                            <span className="text-[10px] text-muted font-mono">
                              {new Date(act.occurred_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground line-clamp-2">{act.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-2">
                <Link
                  href="/projects"
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-border/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-accent" />
                    <span className="font-medium text-foreground">Projects Directory</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                </Link>

                <Link
                  href="/tasks"
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-border/40"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-accent" />
                    <span className="font-medium text-foreground">Kanban Board</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                </Link>

                {(isAdmin || isAccountManager) && (
                  <>
                    <Link
                      href="/invoices"
                      className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <Receipt className="w-4 h-4 text-accent" />
                        <span className="font-medium text-foreground">Invoicing & Billing</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                    </Link>

                    <Link
                      href="/proposals"
                      className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-accent" />
                        <span className="font-medium text-foreground">Proposals & SOWs</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    href="/team"
                    className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-elevated transition-colors text-xs border border-border/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="font-medium text-foreground">Manage Team Roles</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
