"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ProjectMemberRole, Profile } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";

interface ProjectTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberAdded: () => void;
  existingUserIds: string[];
}

export function ProjectTeamModal({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
  existingUserIds,
}: ProjectTeamModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [projectRole, setProjectRole] = useState<ProjectMemberRole>("contributor");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeamMembers() {
      const { data } = await supabase.from("profiles").select("*");
      if (data) {
        setProfiles(data as Profile[]);
      }
    }
    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen]);

  const availableProfiles = profiles.filter((p) => !existingUserIds.includes(p.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg("Please select a team member.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: selectedUserId,
        project_role: projectRole,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      onMemberAdded();
      setSelectedUserId("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to assign member.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Team Member to Project"
      description="Grant access to this project and its tasks with a designated project role."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Team Member *
          </label>
          <select
            required
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="">Select a team member...</option>
            {availableProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email} ({p.role.replace("_", " ")})
              </option>
            ))}
          </select>
          {availableProfiles.length === 0 && (
            <p className="text-[11px] text-muted mt-1">
              All team members are already assigned to this project.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Role in this Project
          </label>
          <select
            value={projectRole}
            onChange={(e) => setProjectRole(e.target.value as ProjectMemberRole)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="lead">Lead (Technical / Project Lead)</option>
            <option value="contributor">Contributor (Developer / Designer)</option>
            <option value="reviewer">Reviewer (QA / Code Reviewer)</option>
          </select>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!selectedUserId}
          >
            Assign Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
