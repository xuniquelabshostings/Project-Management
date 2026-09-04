"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck, Trash2 } from "lucide-react";
import { ProjectMember } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectTeamModal } from "./ProjectTeamModal";
import { supabase } from "@/lib/supabase/client";

interface ProjectTeamListProps {
  projectId: string;
  members: ProjectMember[];
  onMembersUpdated: () => void;
  canManage: boolean;
}

export function ProjectTeamList({
  projectId,
  members,
  onMembersUpdated,
  canManage,
}: ProjectTeamListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the project?")) return;
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      onMembersUpdated();
    } catch (err: any) {
      alert(`Failed to remove member: ${err.message}`);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "lead":
        return "default" as const;
      case "reviewer":
        return "warning" as const;
      case "contributor":
      default:
        return "info" as const;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-foreground">
          Assigned Team Members ({members.length})
        </h3>
        {canManage && (
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Team Member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-lg bg-surface-elevated/30">
          <UserCheck className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted">
            No team members assigned to this project yet.
          </p>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => setIsModalOpen(true)}
            >
              Assign Members
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-lg border border-border bg-surface flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center font-semibold text-xs shrink-0 uppercase">
                  {m.user?.full_name?.charAt(0) || m.user?.email?.charAt(0) || "U"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-foreground truncate">
                    {m.user?.full_name || m.user?.email}
                  </p>
                  <p className="text-[10px] text-muted font-mono truncate">
                    {m.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={getRoleBadgeVariant(m.project_role)}
                  className="text-[10px] capitalize font-mono"
                >
                  {m.project_role}
                </Badge>

                {canManage && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                    title="Remove from project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        existingUserIds={members.map((m) => m.user_id)}
        onMemberAdded={() => onMembersUpdated()}
      />
    </div>
  );
}
