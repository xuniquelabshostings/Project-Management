"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  ArrowRight,
  Code2,
  Building2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { Project, ProjectStatus } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/lib/hooks/useRole";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get("newClient") || undefined;

  const { canCreateClients } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!defaultClientId);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*, client:clients(*), members:project_members(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data as Project[]);
    } catch (err: any) {
      console.warn("Failed to load projects:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client?.company_name &&
          p.client.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tech_stack &&
          p.tech_stack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const totalBudget = useMemo(() => {
    return filteredProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
            Projects & Engagements
          </h1>
          <p className="text-sm text-muted mt-1">
            Deliverables, tech stacks, Kanban task boards, and team assignments
          </p>
        </div>

        {canCreateClients && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> New Project
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search projects, clients, tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="all">All Project Statuses</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {totalBudget > 0 && (
            <div className="text-xs text-muted font-mono bg-surface border border-border px-2.5 py-1.5 rounded-md">
              Total Budget:{" "}
              <span className="text-foreground font-semibold">
                ${totalBudget.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted">
          Loading active projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
          <Briefcase className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No projects found</p>
          <p className="text-xs text-muted mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Create your first project to begin tracking tasks and sprints."}
          </p>
          {canCreateClients && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-lg border border-border bg-surface hover:border-accent/40 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {project.client?.company_name || "Internal Project"}
                  </span>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <Link
                  href={`/projects/view?id=${project.id}`}
                  className="font-serif text-base font-semibold text-foreground hover:text-accent transition-colors block"
                >
                  {project.name}
                </Link>

                {project.description && (
                  <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-surface-elevated text-muted px-1.5 py-0.5 rounded border border-border font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <div>
                  {project.budget ? (
                    <span className="text-muted font-mono">
                      ${Number(project.budget).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted/60">No budget set</span>
                  )}
                </div>

                <Link
                  href={`/projects/view?id=${project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  <span>Open Kanban</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={() => fetchProjects()}
        defaultClientId={defaultClientId}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted">
            Loading projects...
          </div>
        }
      >
        <ProjectsContent />
      </Suspense>
    </DashboardLayout>
  );
}
