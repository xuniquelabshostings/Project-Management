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
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatINR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { MilestonesList } from "@/components/projects/MilestonesList";
import { ProjectTeamList } from "@/components/projects/ProjectTeamList";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Project, Task, Milestone, ProjectMember, ProjectStatus } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/lib/hooks/useRole";
import {
  MOCK_PROJECTS,
  MOCK_CLIENTS,
  MOCK_TASKS,
  MOCK_MILESTONES,
  MOCK_PROFILES,
  getLocalProjects,
  saveLocalProject,
  getLocalClients,
  getLocalTasks,
  isValidUuid,
} from "@/lib/mock-data";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);

      const localProjects = getLocalProjects();
      const localClients = getLocalClients();
      const fallbackProj =
        localProjects.find((p) => p.id === projectId) ||
        MOCK_PROJECTS.find((p) => p.id === projectId);

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
            localClients.find((c) => c.id === activeProj!.client_id) ||
            MOCK_CLIENTS.find((c) => c.id === activeProj!.client_id) ||
            MOCK_CLIENTS[0];
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
      const mockMilestones = MOCK_MILESTONES.filter((m) => m.project_id === projectId);
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

      if (fetchedMilestones.length > 0) {
        const customM = mockMilestones.filter((mm) => !fetchedMilestones.some((fm) => fm.id === mm.id));
        setMilestones([...fetchedMilestones, ...customM]);
      } else {
        setMilestones(mockMilestones);
      }

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

      if (fetchedMembers.length > 0) {
        setMembers(fetchedMembers);
      } else {
        const defaultMembers: ProjectMember[] = [
          {
            id: `mem-${projectId}-1`,
            project_id: projectId,
            user_id: MOCK_PROFILES[0].id,
            project_role: "lead",
            created_at: new Date().toISOString(),
            user: MOCK_PROFILES[0],
          },
          {
            id: `mem-${projectId}-2`,
            project_id: projectId,
            user_id: MOCK_PROFILES[2].id,
            project_role: "contributor",
            created_at: new Date().toISOString(),
            user: MOCK_PROFILES[2],
          },
        ];
        setMembers(defaultMembers);
      }
    } catch (err: any) {
      console.warn("Failed to fetch project workspace data:", err.message);
      const fallbackProj = getLocalProjects().find((p) => p.id === projectId) || MOCK_PROJECTS[0];
      setProject(fallbackProj);
      setTasks(getLocalTasks(projectId));
      setMilestones(MOCK_MILESTONES.filter((m) => m.project_id === projectId));
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
