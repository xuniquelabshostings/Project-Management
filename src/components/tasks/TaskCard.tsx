"use client";

import React from "react";
import { Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { Task, TaskPriority } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const getPriorityDotColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-danger";
      case "high":
        return "bg-warning";
      case "medium":
        return "bg-info";
      case "low":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-lg border border-border bg-surface shadow-2xs hover:border-accent/50 cursor-pointer transition-all ${
        isDragging ? "opacity-50 rotate-1 shadow-lg scale-102" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-xs font-medium text-foreground leading-snug line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5" title={`Priority: ${task.priority}`}>
          <span
            className={`w-2 h-2 rounded-full ${getPriorityDotColor(task.priority)}`}
          />
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-muted line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted">
        {task.due_date ? (
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-muted/80" />
            {new Date(task.due_date).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : (
          <span className="text-muted/60">No due date</span>
        )}

        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}
