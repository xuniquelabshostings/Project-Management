"use client";

import React, { useState } from "react";
import {
  Phone,
  Video,
  MessageSquare,
  Mail,
  CheckCircle2,
  FileText,
  Clock,
  Plus,
  Trash2,
  Activity,
} from "lucide-react";
import { ActivityLogEntry, ActivityType } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityLogModal } from "./ActivityLogModal";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { deleteLocalActivity, isValidUuid } from "@/lib/mock-data";

interface ActivityTimelineProps {
  clientId: string;
  activities: ActivityLogEntry[];
  onActivitiesUpdated: () => void;
}

export function ActivityTimeline({
  clientId,
  activities,
  onActivitiesUpdated,
}: ActivityTimelineProps) {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "call":
        return <Phone className="w-3.5 h-3.5 text-accent" />;
      case "meeting":
        return <Video className="w-3.5 h-3.5 text-info" />;
      case "whatsapp":
        return <MessageSquare className="w-3.5 h-3.5 text-success" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-warning" />;
      case "decision":
        return <CheckCircle2 className="w-3.5 h-3.5 text-accent" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted" />;
    }
  };

  const getActivityBadgeVariant = (type: ActivityType) => {
    switch (type) {
      case "call":
      case "decision":
        return "default" as const;
      case "whatsapp":
        return "success" as const;
      case "meeting":
        return "info" as const;
      case "email":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm("Are you sure you want to delete this interaction log?")) return;
    deleteLocalActivity(activityId);
    try {
      if (isValidUuid(activityId)) {
        await supabase.from("activity_log").delete().eq("id", activityId);
      }
    } catch (err: any) {
      console.warn("Failed to delete activity from database:", err.message);
    }
    onActivitiesUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-foreground">
          Activity & Interaction Timeline ({activities.length})
        </h3>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Log Interaction
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-lg bg-surface-elevated/30">
          <Activity className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted">
            No interactions logged yet for this client.
          </p>
          <p className="text-[11px] text-muted/80 mt-1">
            Log external WhatsApp discussions, calls, or client meetings to keep the entire team aligned.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
            onClick={() => setIsModalOpen(true)}
          >
            Log First Interaction
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {activities.map((item) => {
            const isAuthor = item.logged_by === profile?.id;
            const isAdmin = profile?.role === "admin";

            return (
              <div key={item.id} className="relative group">
                {/* Timeline dot/icon */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-xs">
                  {getActivityIcon(item.type)}
                </div>

                <div className="rounded-lg border border-border bg-surface p-4 text-xs transition-colors hover:border-border/80">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={getActivityBadgeVariant(item.type)}
                        className="text-[10px] font-mono uppercase"
                      >
                        {item.type}
                      </Badge>
                      <span className="font-medium text-foreground">
                        {item.author?.full_name || "Team Member"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted">
                      <span className="font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.occurred_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {(isAuthor || isAdmin) && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-danger transition-opacity"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                    {item.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ActivityLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        onLogged={() => onActivitiesUpdated()}
      />
    </div>
  );
}
