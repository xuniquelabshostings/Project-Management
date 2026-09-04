"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Building2,
  DollarSign,
  ArrowLeft,
  Edit2,
  CheckSquare,
  Flag,
  Users,
  Plus,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { MilestonesList } from "@/components/projects/MilestonesList";
import { ProjectTeamList } from "@/components/projects/ProjectTeamList";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Project, Task, Milestone, ProjectMember } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/lib/hooks/useRole";

function ProjectWorkspaceContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const { canCreateClients, isAdmin, isAccountManager } = useRole();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeTab, setActiveTab] = useState<"kanban" | "milestones" | "team">("kanban");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);

      // 1. Fetch project info
      const { data: pData, error: pErr } = await supabase
        .from("projects")
        .select("*, client:clients(*)")
        .eq("id", projectId)
        .single();

      if (pErr) throw pErr;
      setProject(pData as Project);

      // 2. Fetch tasks
      const { data: tData } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("column_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (tData) setTasks(tData as Task[]);

      // 3. Fetch milestones
      const { data: mData } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true });

      if (mData) setMilestones(mData as Milestone[]);

      // 4. Fetch team members
      const { data: memData } = await supabase
        .from("project_members")
        .select("*, user:profiles(*)")
        .eq("project_id", projectId);

      if (memData) setMembers(memData as ProjectMember[]);
    } catch (err: any) {
      console.warn("Failed to fetch project workspace data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

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
                    {project.client.company_name}
                  </Link>
                ) : (
                  <span>Internal Project</span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                <ProjectStatusBadge status={project.status} />
              </div>

              {project.description && (
                <p className="text-xs text-muted max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                {project.budget && (isAdmin || isAccountManager) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    Budget:{" "}
                    <strong className="text-foreground font-mono">
                      ${Number(project.budget).toLocaleString()}
                    </strong>
                  </span>
                )}
                {(project.start_date || project.end_date) && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {project.start_date || "TBD"} &rarr; {project.end_date || "TBD"}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-muted" />
                  {members.length} team members
                </span>
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
              {canCreateClients && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              )}
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

        <button
          onClick={() => setActiveTab("team")}
          className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
            activeTab === "team"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Team ({members.length})
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

      {activeTab === "team" && (
        <ProjectTeamList
          projectId={projectId}
          members={members}
          onMembersUpdated={fetchProjectData}
          canManage={canCreateClients}
        />
      )}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        projectToEdit={project}
        onSaved={() => fetchProjectData()}
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
