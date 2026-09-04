"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Project, ProjectStatus, Client } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (project: Project) => void;
  projectToEdit?: Project | null;
  defaultClientId?: string;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  defaultClientId,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("id, company_name")
        .order("company_name", { ascending: true });
      if (data) {
        setClients(data as Client[]);
      }
    }
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setClientId(projectToEdit.client_id);
      setDescription(projectToEdit.description || "");
      setTechStackInput(projectToEdit.tech_stack ? projectToEdit.tech_stack.join(", ") : "");
      setBudget(projectToEdit.budget ? String(projectToEdit.budget) : "");
      setStartDate(projectToEdit.start_date || "");
      setEndDate(projectToEdit.end_date || "");
      setStatus(projectToEdit.status);
    } else {
      setName("");
      setClientId(defaultClientId || "");
      setDescription("");
      setTechStackInput("");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setStatus("active");
    }
    setErrorMsg(null);
  }, [projectToEdit, isOpen, defaultClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }
    if (!clientId) {
      setErrorMsg("Please select a client for this project.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const techArray = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name: name.trim(),
      client_id: clientId,
      description: description.trim() || null,
      tech_stack: techArray,
      budget: budget ? parseFloat(budget) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (projectToEdit) {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", projectToEdit.id)
          .select("*, client:clients(*)")
          .single();

        if (error) throw error;
        onSaved(data as Project);
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            ...payload,
            kanban_columns: ["To Do", "In Progress", "Review", "Done"],
            created_at: new Date().toISOString(),
          })
          .select("*, client:clients(*)")
          .single();

        if (error) throw error;
        onSaved(data as Project);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save project.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Edit Project" : "Create New Project"}
      description="Define the scope, deliverables, budget, and timeline."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Client Account *
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={!!projectToEdit}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-60"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Project Name *
          </label>
          <Input
            required
            placeholder="e.g. Customer Portal Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Scope & Description
          </label>
          <Textarea
            rows={3}
            placeholder="Brief scope, deliverables, or objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Estimated Budget (USD)
            </label>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="25000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Tech Stack (comma-separated)
          </label>
          <Input
            placeholder="Next.js, Tailwind, PostgreSQL, Docker"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target Completion Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {projectToEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
