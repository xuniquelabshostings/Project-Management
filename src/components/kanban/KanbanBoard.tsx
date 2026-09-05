"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal, CheckCircle2, MoveRight } from "lucide-react";
import { Task, TaskPriority } from "@/types/database.types";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { saveLocalTask, deleteLocalTask, isValidUuid } from "@/lib/mock-data";

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  columns?: string[];
  onTasksUpdated: () => void;
}

export function KanbanBoard({
  projectId,
  tasks,
  columns = ["To Do", "In Progress", "Review", "Done"],
  onTasksUpdated,
}: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<string>("To Do");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleOpenNewTask = (columnName: string) => {
    setSelectedTask(null);
    setModalColumn(columnName);
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalColumn(task.kanban_column);
    setIsModalOpen(true);
  };

  const handleMoveColumn = async (task: Task, targetColumn: string) => {
    if (task.kanban_column === targetColumn) return;

    // Optimistically update
    task.kanban_column = targetColumn;
    saveLocalTask(task);
    onTasksUpdated();

    try {
      if (isValidUuid(task.id) && !task.id.startsWith("a0000000")) {
        const { error } = await supabase
          .from("tasks")
          .update({
            kanban_column: targetColumn,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id);

        if (error) {
          console.warn("Could not update task column in database:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Failed to move task in database:", err.message);
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;

    deleteLocalTask(taskId);
    try {
      if (isValidUuid(taskId)) {
        await supabase.from("tasks").delete().eq("id", taskId);
      }
    } catch (err: any) {
      console.warn("Failed to delete task in database:", err.message);
    }
    onTasksUpdated();
  };

  return (
    <div className="space-y-4">
      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((columnName) => {
          const columnTasks = tasks.filter((t) => t.kanban_column === columnName);

          const isColumnDraggedOver = dragOverColumn === columnName;

          return (
            <div
              key={columnName}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverColumn !== columnName) {
                  setDragOverColumn(columnName);
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
                const draggedTask = tasks.find((t) => t.id === droppedTaskId);
                if (draggedTask) {
                  handleMoveColumn(draggedTask, columnName);
                }
                setDraggingTaskId(null);
                setDragOverColumn(null);
              }}
              className={`rounded-lg border transition-all duration-150 p-3 flex flex-col min-w-[260px] ${
                isColumnDraggedOver
                  ? "border-accent bg-accent/10 ring-2 ring-accent/30 shadow-md scale-[1.01]"
                  : "border-border bg-surface-elevated/40"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {columnName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface border border-border text-muted">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenNewTask(columnName)}
                  className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                  title={`Add task to ${columnName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks in column */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px]">
                {/* Active Drop Placeholder */}
                {isColumnDraggedOver && draggingTaskId && (
                  <div className="py-2.5 px-3 border-2 border-dashed border-accent/70 bg-accent/10 rounded-lg flex items-center justify-center text-xs font-medium text-accent animate-pulse">
                    Drop to move to {columnName}
                  </div>
                )}

                {columnTasks.length === 0 && !isColumnDraggedOver ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-border/50 rounded-md text-[11px] text-muted/60">
                    Drop or add tasks here
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", task.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingTaskId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setDragOverColumn(null);
                      }}
                      className={`relative group select-none transition-all duration-150 ${
                        draggingTaskId === task.id
                          ? "opacity-35 scale-95 ring-2 ring-accent/40 rounded-lg"
                          : "hover:-translate-y-0.5"
                      }`}
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggingTaskId === task.id}
                        onClick={() => handleOpenEditTask(task)}
                      />

                      {/* Quick Move stage helper menu */}
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface/95 border border-border rounded p-0.5 shadow-xs">
                        <select
                          value={task.kanban_column}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleMoveColumn(task, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] bg-transparent text-foreground border-0 focus:outline-none pr-1 cursor-pointer"
                        >
                          {columns.map((c) => (
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

              {/* Quick Add Button at column bottom */}
              <button
                onClick={() => handleOpenNewTask(columnName)}
                className="w-full mt-2 py-1.5 px-2 rounded-md border border-dashed border-border/60 text-[11px] text-muted hover:text-foreground hover:bg-surface transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </div>
          );
        })}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        columns={columns}
        taskToEdit={selectedTask}
        defaultColumn={modalColumn}
        onSaved={() => onTasksUpdated()}
      />
    </div>
  );
}
