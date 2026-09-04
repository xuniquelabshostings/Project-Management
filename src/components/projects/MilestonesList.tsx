"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Calendar, Plus, Edit2, Trash2, Flag } from "lucide-react";
import { Milestone } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MilestoneModal } from "./MilestoneModal";
import { supabase } from "@/lib/supabase/client";

interface MilestonesListProps {
  projectId: string;
  milestones: Milestone[];
  onMilestonesUpdated: () => void;
}

export function MilestonesList({
  projectId,
  milestones,
  onMilestonesUpdated,
}: MilestonesListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleToggleComplete = async (milestone: Milestone) => {
    try {
      const { error } = await supabase
        .from("milestones")
        .update({ completed: !milestone.completed })
        .eq("id", milestone.id);

      if (error) throw error;
      onMilestonesUpdated();
    } catch (err: any) {
      alert(`Failed to update milestone: ${err.message}`);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      const { error } = await supabase.from("milestones").delete().eq("id", milestoneId);
      if (error) throw error;
      onMilestonesUpdated();
    } catch (err: any) {
      alert(`Failed to delete milestone: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-semibold text-foreground">
            Project Milestones & Key Phases ({completedCount}/{milestones.length} Completed)
          </h3>
          {milestones.length > 0 && (
            <div className="w-48 bg-surface-elevated rounded-full h-1.5 mt-2 overflow-hidden border border-border">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingMilestone(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-lg bg-surface-elevated/30">
          <Flag className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted">
            No milestones configured for this project yet.
          </p>
          <p className="text-[11px] text-muted/80 mt-1">
            Milestones represent major delivery dates, independent of daily tasks.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
            onClick={() => {
              setEditingMilestone(null);
              setIsModalOpen(true);
            }}
          >
            Create First Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => {
            const isPastDue =
              m.due_date &&
              !m.completed &&
              new Date(m.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={m.id}
                className={`p-4 rounded-lg border bg-surface transition-all flex items-start justify-between gap-4 ${
                  m.completed
                    ? "border-border/60 opacity-80"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(m)}
                    className="mt-0.5 text-muted hover:text-accent transition-colors"
                    title={m.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success fill-success-bg" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted hover:text-foreground" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        m.completed ? "line-through text-muted" : "text-foreground"
                      }`}
                    >
                      {m.title}
                    </h4>
                    {m.description && (
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {m.due_date && (
                        <span
                          className={`flex items-center gap-1 font-mono text-[11px] ${
                            isPastDue ? "text-danger font-semibold" : "text-muted"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(m.due_date).toLocaleDateString()}
                          {isPastDue && " (Overdue)"}
                        </span>
                      )}

                      <Badge
                        variant={m.completed ? "success" : isPastDue ? "danger" : "secondary"}
                        className="text-[10px]"
                      >
                        {m.completed ? "Completed" : isPastDue ? "Overdue" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingMilestone(m);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    title="Edit Milestone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        milestoneToEdit={editingMilestone}
        onSaved={() => onMilestonesUpdated()}
      />
    </div>
  );
}
