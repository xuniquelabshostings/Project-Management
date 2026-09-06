"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Calendar,
  Filter,
  ArrowRight,
  Briefcase,
  Clock,
  Columns,
  List as ListIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task, TaskPriority, Project } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { getLocalTasks, getLocalProjects } from "@/lib/mock-data";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(() =>
    typeof window !== "undefined" ? getLocalProjects() : []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<string>("all");

  const fetchTasksAndProjects = async () => {
    try {
      setIsLoading(true);

      const [tasksRes, projectsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*, project:projects(*)")
          .order("due_date", { ascending: true }),
        supabase.from("projects").select("id, name").order("name", { ascending: true }),
      ]);

      if (tasksRes.data && tasksRes.data.length > 0) {
        setTasks(tasksRes.data as Task[]);
      } else {
        setTasks(getLocalTasks());
      }

      const localProjects = getLocalProjects();
      if (projectsRes.data && projectsRes.data.length > 0) {
        const custom = localProjects.filter((p) => !projectsRes.data!.some((d) => d.id === p.id));
        setProjects([...custom, ...(projectsRes.data as Project[])]);
      } else {
        setProjects(localProjects);
      }
    } catch (err: any) {
      console.warn("Failed to load tasks, using fallback:", err.message);
      setTasks(getLocalTasks());
      setProjects(getLocalProjects());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.project?.name && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProject =
        selectedProject === "all" || t.project_id === selectedProject;

      const matchesPriority =
        selectedPriority === "all" || t.priority === selectedPriority;

      return matchesSearch && matchesProject && matchesPriority;
    });
  }, [tasks, searchQuery, selectedProject, selectedPriority]);

  const globalColumns = ["To Do", "In Progress", "Review", "Done"];

  const handleMoveColumn = async (taskId: string, targetColumn: string) => {
    // 1. Optimistically update local state immediately
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, kanban_column: targetColumn } : t))
    );

    // 2. Sync to Supabase if it's a live database UUID
    try {
      if (!taskId.startsWith("a0000000")) {
        const { error } = await supabase
          .from("tasks")
          .update({
            kanban_column: targetColumn,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (error) {
          console.warn("Could not persist task move to Supabase:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Error moving task:", err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
              Tasks & Kanban Board
            </h1>
            <p className="text-sm text-muted mt-1">
              Internal coordination & sprint delivery across all active projects
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex items-center border border-border rounded-md bg-surface p-0.5 text-xs">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === "board"
                  ? "bg-surface-elevated text-foreground font-medium shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-surface-elevated text-foreground font-medium shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List / Deadlines</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search tasks, descriptions, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* View Mode */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted">
            Loading team tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
            <CheckSquare className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No tasks match your filters</p>
            <p className="text-xs text-muted mt-1">
              Check tasks within individual project workspaces to create new action items.
            </p>
          </div>
        ) : viewMode === "board" ? (
          /* Cross-Project Board View */
          <div className="space-y-4">
            {/* Mobile Column Switcher (visible on < sm screens) */}
            <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setMobileActiveColumn("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  mobileActiveColumn === "all"
                    ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                All ({filteredTasks.length})
              </button>
              {globalColumns.map((col) => {
                const count = filteredTasks.filter((t) => t.kanban_column === col).length;
                return (
                  <button
                    key={col}
                    onClick={() => setMobileActiveColumn(col)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      mobileActiveColumn === col
                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                        : "bg-surface border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span>{col}</span>
                    <span className="font-mono text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
              {globalColumns.map((colName) => {
                const colTasks = filteredTasks.filter(
                  (t) => t.kanban_column === colName
                );

                const isColumnDraggedOver = dragOverColumn === colName;
                const isHiddenOnMobile =
                  mobileActiveColumn !== "all" && mobileActiveColumn !== colName;

                return (
                  <div
                    key={colName}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverColumn !== colName) {
                        setDragOverColumn(colName);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverColumn(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedTaskId =
                        e.dataTransfer.getData("text/plain") || draggingTaskId;
                      if (droppedTaskId) {
                        handleMoveColumn(droppedTaskId, colName);
                      }
                      setDraggingTaskId(null);
                      setDragOverColumn(null);
                    }}
                    className={`rounded-lg border transition-all duration-150 p-3 flex-col min-w-[260px] ${
                      isHiddenOnMobile ? "hidden sm:flex" : "flex"
                    } ${
                      isColumnDraggedOver
                        ? "border-accent bg-accent/10 ring-2 ring-accent/30 shadow-md scale-[1.01]"
                        : "border-border bg-surface-elevated/40"
                    }`}
                  >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <span className="text-xs font-semibold text-foreground">
                      {colName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface border border-border text-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px]">
                    {/* Active Drag Drop Indicator */}
                    {isColumnDraggedOver && draggingTaskId && (
                      <div className="py-2.5 px-3 border-2 border-dashed border-accent/70 bg-accent/10 rounded-lg flex items-center justify-center text-xs font-medium text-accent animate-pulse">
                        Drop to move to {colName}
                      </div>
                    )}

                    {colTasks.length === 0 && !isColumnDraggedOver ? (
                      <div className="h-20 flex items-center justify-center border border-dashed border-border/40 rounded-md text-[11px] text-muted/60">
                        Drop tasks here
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", t.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDraggingTaskId(t.id);
                          }}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                            setDragOverColumn(null);
                          }}
                          className={`relative group select-none transition-all duration-150 ${
                            draggingTaskId === t.id
                              ? "opacity-35 scale-95 ring-2 ring-accent/40 rounded-lg"
                              : "hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="mb-1 text-[10px] text-muted flex items-center gap-1 truncate font-medium">
                            <Briefcase className="w-3 h-3 text-muted/70 shrink-0" />
                            <Link
                              href={`/projects/view?id=${t.project_id}`}
                              className="hover:text-accent truncate"
                            >
                              {t.project?.name || "Project"}
                            </Link>
                          </div>
                          <TaskCard task={t} isDragging={draggingTaskId === t.id} />

                          {/* Quick stage switch fallback */}
                          <div className="absolute right-2 bottom-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface/95 border border-border rounded p-0.5 shadow-xs">
                            <select
                              value={t.kanban_column}
                              onChange={(e) => handleMoveColumn(t.id, e.target.value)}
                              className="text-[9px] bg-transparent text-foreground border-0 focus:outline-none pr-1 cursor-pointer"
                            >
                              {globalColumns.map((c) => (
                                <option key={c} value={c}>
                                  &rarr; {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ) : (
          /* List / Deadlines View */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Column / Stage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted line-clamp-1 mt-0.5">
                            {t.description}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/projects/view?id=${t.project_id}`}
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                        >
                          <Briefcase className="w-3 h-3" />
                          {t.project?.name || "Project"}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {t.kanban_column}
                        </Badge>
                      </TableCell>

                      <TableCell>
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
                      </TableCell>

                      <TableCell className="text-xs font-mono">
                        {t.due_date ? (
                          <span
                            className={`flex items-center gap-1 ${
                              new Date(t.due_date) <
                              new Date(new Date().setHours(0, 0, 0, 0))
                                ? "text-danger font-semibold"
                                : "text-muted"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(t.due_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/projects/view?id=${t.project_id}`}>
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            Open Board
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
