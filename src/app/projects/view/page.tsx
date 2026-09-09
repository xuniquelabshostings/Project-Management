"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Building2,
  IndianRupee,
  ArrowLeft,
  Edit2,
  CheckSquare,
  Flag,
  Users,
  Plus,
  MessageSquare,
  Globe,
  Server,
  AlertTriangle,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { MilestonesList } from "@/components/projects/MilestonesList";
import { ProjectTeamList } from "@/components/projects/ProjectTeamList";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Project, Task, Milestone, ProjectMember, ProjectStatus, Client } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/lib/hooks/useRole";
import {
  getLocalProjects,
  saveLocalProject,
  getLocalClients,
  getLocalTasks,
  isValidUuid,
} from "@/lib/mock-data";
import { sendClientWhatsAppRenewalAlert } from "@/lib/renewal-alert";

function getRenewalStatus(renewDateStr?: string | null, alertDays = 30) {
  if (!renewDateStr) return null;
  const target = new Date(renewDateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired" as const,
      label: `Expired ${Math.abs(diffDays)}d ago`,
      diffDays,
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/30",
    };
  }
  if (diffDays === 0) {
    return {
      status: "due_today" as const,
      label: "Expires Today",
      diffDays: 0,
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/30",
    };
  }
  if (diffDays <= alertDays) {
    return {
      status: "expiring_soon" as const,
      label: `${diffDays} days left`,
      diffDays,
      badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    };
  }
  return {
    status: "active" as const,
    label: `${diffDays} days left`,
    diffDays,
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  };
}

function ProjectWorkspaceContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const { canCreateClients, isAdmin, isAccountManager } = useRole();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeTab, setActiveTab] = useState<"kanban" | "milestones">("kanban");
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const handleSendWhatsAppAlert = async () => {
    if (!project) return;
    setIsAlertSending(true);
    try {
      const clientForAlert = project.client || (project.client_id ? getLocalClients().find((c) => c.id === project.client_id) : undefined) || {
        id: project.client_id,
        company_name: project.name,
        client_name: project.name,
        domain_name: project.domain_name,
        domain_registrar: project.domain_registrar,
        domain_registered_at: project.domain_registered_at,
        domain_renew_at: project.domain_renew_at,
        domain_price: project.domain_price,
        hosting_provider: project.hosting_provider,
        hosting_plan: project.hosting_plan,
        hosting_activated_at: project.hosting_activated_at,
        hosting_renew_at: project.hosting_renew_at,
        hosting_price: project.hosting_price,
        renewal_alert_days: project.renewal_alert_days,
        status: "active" as const,
        tags: [],
        account_manager_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await sendClientWhatsAppRenewalAlert(clientForAlert as Client, (clientForAlert as any).contacts, true);
      if (res.updatedClient) {
        setProject((prev) => (prev ? {
          ...prev,
          domain_name: res.updatedClient?.domain_name ?? prev.domain_name,
          domain_registrar: res.updatedClient?.domain_registrar ?? prev.domain_registrar,
          domain_registered_at: res.updatedClient?.domain_registered_at ?? prev.domain_registered_at,
          domain_renew_at: res.updatedClient?.domain_renew_at ?? prev.domain_renew_at,
        } : null));
      }
    } catch (err: any) {
      console.error("Failed to send WhatsApp alert:", err);
    } finally {
      setIsAlertSending(false);
    }
  };

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);

      const localProjects = getLocalProjects();
      const localClients = getLocalClients();
      const fallbackProj = localProjects.find((p) => p.id === projectId) || null;

      // 1. Fetch project info from Supabase if valid UUID
      let activeProj: Project | null = null;
      if (isValidUuid(projectId)) {
        try {
          const { data: pData, error: pErr } = await supabase
            .from("projects")
            .select("*, client:clients(*)")
            .eq("id", projectId)
            .single();

          if (!pErr && pData) {
            activeProj = pData as Project;
          }
        } catch {
          // use fallback
        }
      }

      if (fallbackProj) {
        if (!activeProj) {
          activeProj = { ...fallbackProj };
        } else if (fallbackProj.updated_at && activeProj.updated_at) {
          // If local copy was edited more recently, keep the latest local status & edits!
          if (new Date(fallbackProj.updated_at).getTime() >= new Date(activeProj.updated_at).getTime()) {
            activeProj = {
              ...activeProj,
              ...fallbackProj,
              client: activeProj.client || fallbackProj.client,
            };
          }
        }
      }

      if (activeProj) {
        if (!activeProj.client && activeProj.client_id) {
          activeProj.client =
            localClients.find((c) => c.id === activeProj!.client_id) || undefined;
        }
        setProject(activeProj);
      } else {
        setProject(null);
      }

      // 2. Fetch tasks
      const localTasks = getLocalTasks(projectId);
      let fetchedTasks: Task[] = [];
      if (isValidUuid(projectId)) {
        try {
          const { data: tData } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", projectId)
            .order("column_order", { ascending: true })
            .order("created_at", { ascending: false });

          if (tData && tData.length > 0) {
            fetchedTasks = tData as Task[];
          }
        } catch {}
      }

      if (fetchedTasks.length > 0) {
        const customT = localTasks.filter((lt) => !fetchedTasks.some((ft) => ft.id === lt.id));
        setTasks([...fetchedTasks, ...customT]);
      } else {
        setTasks(localTasks);
      }

      // 3. Fetch milestones
      let fetchedMilestones: Milestone[] = [];
      if (isValidUuid(projectId)) {
        try {
          const { data: mData } = await supabase
            .from("milestones")
            .select("*")
            .eq("project_id", projectId)
            .order("due_date", { ascending: true });

          if (mData && mData.length > 0) {
            fetchedMilestones = mData as Milestone[];
          }
        } catch {}
      }
      setMilestones(fetchedMilestones);

      // 4. Fetch team members
      let fetchedMembers: ProjectMember[] = [];
      if (isValidUuid(projectId)) {
        try {
          const { data: memData } = await supabase
            .from("project_members")
            .select("*, user:profiles(*)")
            .eq("project_id", projectId);

          if (memData && memData.length > 0) {
            fetchedMembers = memData as ProjectMember[];
          }
        } catch {}
      }
      setMembers(fetchedMembers);
    } catch (err: any) {
      console.warn("Failed to fetch project workspace data:", err.message);
      const fallbackProj = getLocalProjects().find((p) => p.id === projectId) || null;
      setProject(fallbackProj);
      setTasks(getLocalTasks(projectId));
      setMilestones([]);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    const nowIso = new Date().toISOString();
    const updated: Project = {
      ...project,
      status: newStatus,
      updated_at: nowIso,
    };

    // 1. Instant local update
    setProject(updated);
    saveLocalProject(updated);

    // 2. Persist to Supabase if valid UUID
    if (isValidUuid(project.id)) {
      try {
        await supabase
          .from("projects")
          .update({ status: newStatus, updated_at: nowIso })
          .eq("id", project.id);
      } catch (err) {
        console.warn("Could not sync project status to Supabase:", err);
      }
    }
  };

  if (!projectId) {
    return (
      <div className="p-8 text-center text-sm text-muted">
        No project ID specified. Return to{" "}
        <Link href="/projects" className="text-accent underline">
          projects directory
        </Link>
        .
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-muted">
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Project Not Found or Access Denied
        </h2>
        <p className="text-xs text-muted mt-2">
          This project may not exist or your account may not have permission to view it.
        </p>
        <Link href="/projects">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const columns = project.kanban_columns || ["To Do", "In Progress", "Review", "Done"];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
      </div>

      {/* Project Overview Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Building2 className="w-3.5 h-3.5" />
                {project.client ? (
                  <Link
                    href={`/clients/view?id=${project.client.id}`}
                    className="hover:text-accent underline font-medium"
                  >
                    {project.client.client_name || project.client.company_name}
                  </Link>
                ) : (
                  <span>Internal Project</span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                <div className="relative inline-flex items-center">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                    className="text-xs font-semibold rounded-md border border-border bg-surface px-2.5 py-1 text-foreground shadow-xs cursor-pointer hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    title="Change Project Status"
                  >
                    <option value="planning">📋 Planning</option>
                    <option value="active">⚡ Active</option>
                    <option value="on_hold">⏸️ On Hold</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>

              {project.description && (
                <p className="text-xs text-muted max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                {project.budget && (
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-accent" />
                    Budget:{" "}
                    <strong className="text-foreground font-mono">
                      {formatINR(project.budget)}
                    </strong>
                  </span>
                )}
                {(project.start_date || project.end_date) && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {project.start_date || "TBD"} &rarr; {project.end_date || "TBD"}
                  </span>
                )}
                {(project.domain_name || project.client?.domain_name) && (
                  <a
                    href={`https://${(project.domain_name || project.client?.domain_name || "").replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-accent hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {(project.domain_name || project.client?.domain_name || "").replace(/^https?:\/\//, "")}
                  </a>
                )}
                {(project.hosting_provider || project.client?.hosting_provider) && (
                  <span className="flex items-center gap-1 font-mono text-xs text-muted">
                    <Server className="w-3.5 h-3.5 text-accent" />
                    {project.hosting_provider || project.client?.hosting_provider}
                    {(project.hosting_plan || project.client?.hosting_plan) ? ` (${project.hosting_plan || project.client?.hosting_plan})` : ""}
                  </span>
                )}
              </div>

              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {project.tech_stack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-surface-elevated text-muted px-2 py-0.5 rounded border border-border font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsNewTaskModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure & Service Renewals Section */}
      {(() => {
        const domainRenewDate = project.domain_renew_at || project.client?.domain_renew_at;
        const hostingRenewDate = project.hosting_renew_at || project.client?.hosting_renew_at;
        const alertDays = project.renewal_alert_days || project.client?.renewal_alert_days || 30;

        const domainStatus = getRenewalStatus(domainRenewDate, alertDays);
        const hostingStatus = getRenewalStatus(hostingRenewDate, alertDays);
        const hasAlert =
          (domainStatus && (domainStatus.status === "expiring_soon" || domainStatus.status === "expired" || domainStatus.status === "due_today")) ||
          (hostingStatus && (hostingStatus.status === "expiring_soon" || hostingStatus.status === "expired" || hostingStatus.status === "due_today"));

        const domainName = project.domain_name || project.client?.domain_name;
        const domainRegistrar = project.domain_registrar || project.client?.domain_registrar;
        const domainRegisteredAt = project.domain_registered_at || project.client?.domain_registered_at;
        const domainPrice = project.domain_price ?? project.client?.domain_price;

        const hostingProvider = project.hosting_provider || project.client?.hosting_provider;
        const hostingPlan = project.hosting_plan || project.client?.hosting_plan;
        const hostingActivatedAt = project.hosting_activated_at || project.client?.hosting_activated_at;
        const hostingPrice = project.hosting_price ?? project.client?.hosting_price;

        const hasInfra = Boolean(domainName || hostingProvider || domainRenewDate || hostingRenewDate);

        return (
          <Card className="border-border bg-surface shadow-xs">
            <CardHeader className="py-3 px-5 border-b border-border/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-semibold">Infrastructure & Service Renewals</CardTitle>
                {hasAlert && (
                  <span className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Renewal Alert
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasInfra && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAlertSending}
                    className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-500/30 dark:hover:bg-emerald-950/30 font-medium disabled:opacity-60"
                    onClick={handleSendWhatsAppAlert}
                    title="Automatically queries live WHOIS and opens WhatsApp with client renewal dates"
                  >
                    {isAlertSending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-emerald-500" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    )}
                    <span>{isAlertSending ? "Fetching WHOIS..." : "WhatsApp Renewal Alert"}</span>
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="w-3 h-3 mr-1" /> {hasInfra ? "Edit Infra" : "Setup Infra"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {!hasInfra ? (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-surface-elevated/40 border border-dashed border-border gap-3 text-center sm:text-left">
                  <div>
                    <p className="text-xs font-semibold text-foreground">No domain or hosting infrastructure tracked</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Store domain registrar, expiration dates, hosting plans, and send automatic WhatsApp renewal reminders.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Configure Domain & Hosting
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Domain Card */}
                  <div className="p-4 rounded-lg border border-border/80 bg-surface-elevated/40 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">Domain Registration</h4>
                            <p className="text-[10px] text-muted">
                              {domainRegistrar || "Registrar unrecorded"}
                            </p>
                          </div>
                        </div>
                        {domainStatus && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${domainStatus.badgeClass}`}
                          >
                            {domainStatus.label}
                          </span>
                        )}
                      </div>

                      {domainName ? (
                        <div className="my-2">
                          <a
                            href={`https://${domainName.replace(/^https?:\/\//, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono font-medium text-accent hover:underline flex items-center gap-1.5"
                          >
                            {domainName}
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic my-2">No domain name specified</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-muted block">Registered</span>
                          <span className="font-medium text-foreground">
                            {domainRegisteredAt || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">Renewal / Expiry</span>
                          <span className="font-medium text-foreground">
                            {domainRenewDate || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {domainPrice != null && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-muted">Domain Cost:</span>
                        <span className="font-semibold text-foreground">{formatINR(domainPrice)} / yr</span>
                      </div>
                    )}
                  </div>

                  {/* Hosting Card */}
                  <div className="p-4 rounded-lg border border-border/80 bg-surface-elevated/40 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">Web Hosting & Server</h4>
                            <p className="text-[10px] text-muted">
                              {hostingProvider || "Provider unrecorded"}
                            </p>
                          </div>
                        </div>
                        {hostingStatus && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${hostingStatus.badgeClass}`}
                          >
                            {hostingStatus.label}
                          </span>
                        )}
                      </div>

                      {hostingPlan ? (
                        <div className="my-2">
                          <span className="text-sm font-medium text-foreground">
                            {hostingPlan}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic my-2">No plan specified</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-muted block">Activated On</span>
                          <span className="font-medium text-foreground">
                            {hostingActivatedAt || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">Renewal Date</span>
                          <span className="font-medium text-foreground">
                            {hostingRenewDate || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {hostingPrice != null && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-muted">Hosting Cost:</span>
                        <span className="font-semibold text-foreground">{formatINR(hostingPrice)} / yr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Workspace Tabs */}
      <div className="border-b border-border/60 flex items-center gap-6 text-sm">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "kanban"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Kanban Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("milestones")}
          className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "milestones"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Flag className="w-4 h-4" />
          Milestones ({milestones.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "kanban" && (
        <KanbanBoard
          projectId={projectId}
          tasks={tasks}
          columns={columns}
          onTasksUpdated={fetchProjectData}
        />
      )}

      {activeTab === "milestones" && (
        <MilestonesList
          projectId={projectId}
          milestones={milestones}
          onMilestonesUpdated={fetchProjectData}
        />
      )}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        projectToEdit={project}
        onSaved={(updatedProj) => {
          setProject(updatedProj);
          fetchProjectData();
        }}
      />

      {/* Quick Add Task Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        projectId={projectId}
        columns={columns}
        onSaved={() => fetchProjectData()}
      />
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted">
            Loading project workspace...
          </div>
        }
      >
        <ProjectWorkspaceContent />
      </Suspense>
    </DashboardLayout>
  );
}
