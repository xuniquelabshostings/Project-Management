"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Task, TaskPriority, Profile, Project } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  columns?: string[];
  onSaved: (task: Task) => void;
  taskToEdit?: Task | null;
  defaultColumn?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  projectId,
  columns = ["To Do", "In Progress", "Review", "Done"],
  onSaved,
  taskToEdit,
  defaultColumn = "To Do",
}: TaskModalProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [column, setColumn] = useState(defaultColumn);
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority);
      setColumn(taskToEdit.kanban_column);
      setDueDate(taskToEdit.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setColumn(defaultColumn || columns[0] || "To Do");
      setDueDate("");
    }
    setErrorMsg(null);
  }, [taskToEdit, isOpen, defaultColumn, columns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Task title is required.");
      return;
    }
    if (!profile) {
      setErrorMsg("You must be logged in to create or edit tasks.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      kanban_column: column,
      due_date: dueDate || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (taskToEdit) {
        const { data, error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", taskToEdit.id)
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Task);
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            ...payload,
            column_order: 0,
            created_by: profile.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Task);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save task.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
      description="Add task details, priority, due date, and assign to Kanban column."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Task Title *
          </label>
          <Input
            required
            placeholder="e.g. Redesign navigation menu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Description / Acceptance Criteria
          </label>
          <Textarea
            rows={3}
            placeholder="Add detailed context, links, or specifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Kanban Column
            </label>
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
