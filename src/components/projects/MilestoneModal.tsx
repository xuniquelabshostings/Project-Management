"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Milestone } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaved: (milestone: Milestone) => void;
  milestoneToEdit?: Milestone | null;
}

export function MilestoneModal({
  isOpen,
  onClose,
  projectId,
  onSaved,
  milestoneToEdit,
}: MilestoneModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (milestoneToEdit) {
      setTitle(milestoneToEdit.title);
      setDescription(milestoneToEdit.description || "");
      setDueDate(milestoneToEdit.due_date || "");
      setCompleted(milestoneToEdit.completed);
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setCompleted(false);
    }
    setErrorMsg(null);
  }, [milestoneToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Milestone title is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      completed,
    };

    try {
      if (milestoneToEdit) {
        const { data, error } = await supabase
          .from("milestones")
          .update(payload)
          .eq("id", milestoneToEdit.id)
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Milestone);
      } else {
        const { data, error } = await supabase
          .from("milestones")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        onSaved(data as Milestone);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save milestone.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestoneToEdit ? "Edit Milestone" : "Add Project Milestone"}
      description="Track high-level project deliverables, sprints, or payment trigger phases."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Milestone Title *
          </label>
          <Input
            required
            placeholder="e.g. Phase 1: Authentication & Core Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Deliverables / Scope Description
          </label>
          <Textarea
            rows={3}
            placeholder="Details of what constitutes completion for this phase..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Target Due Date
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="completed-checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <label
            htmlFor="completed-checkbox"
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            Mark this milestone as completed
          </label>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {milestoneToEdit ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
