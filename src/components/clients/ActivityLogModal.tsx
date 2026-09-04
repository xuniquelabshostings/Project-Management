"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ActivityType, ActivityLogEntry } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { isValidUuid, generateUUID, saveLocalActivity } from "@/lib/mock-data";

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onLogged: (entry: ActivityLogEntry) => void;
}

export function ActivityLogModal({ isOpen, onClose, clientId, onLogged }: ActivityLogModalProps) {
  const { profile } = useAuth();
  const [type, setType] = useState<ActivityType>("call");
  const [summary, setSummary] = useState("");
  const [occurredAtDate, setOccurredAtDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [occurredAtTime, setOccurredAtTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveLocally = (fullTimestamp: string) => {
    const mockActivity: ActivityLogEntry = {
      id: generateUUID(),
      client_id: clientId,
      logged_by: profile?.id || "00000000-0000-0000-0000-000000000001",
      type,
      summary: summary.trim(),
      occurred_at: fullTimestamp,
      created_at: new Date().toISOString(),
      author: profile || undefined,
    };
    saveLocalActivity(mockActivity);
    onLogged(mockActivity);
    setSummary("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setErrorMsg("Summary / discussion notes cannot be empty.");
      return;
    }
    if (!profile) {
      setErrorMsg("You must be logged in to log an interaction.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const fullTimestamp = new Date(`${occurredAtDate}T${occurredAtTime}:00`).toISOString();

    // If client ID is local or profile is demo, save directly to local store
    if (!isValidUuid(clientId) || profile.id.startsWith("00000000")) {
      saveLocally(fullTimestamp);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("activity_log")
        .insert({
          client_id: clientId,
          logged_by: profile.id,
          type,
          summary: summary.trim(),
          occurred_at: fullTimestamp,
          created_at: new Date().toISOString(),
        })
        .select("*, author:profiles(*)")
        .single();

      if (error) throw error;
      saveLocalActivity(data as ActivityLogEntry);
      onLogged(data as ActivityLogEntry);
      setSummary("");
      onClose();
    } catch (err: any) {
      if (
        err.message?.toLowerCase().includes("row-level security") ||
        err.code === "42501" ||
        err.code === "22P02" ||
        err.status === 403
      ) {
        saveLocally(fullTimestamp);
        return;
      }
      setErrorMsg(err.message || "Failed to log activity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Client Interaction"
      description="Record key details from external calls, WhatsApp messages, emails, or meetings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Interaction Channel / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="call">Phone Call</option>
              <option value="meeting">Video / In-person Meeting</option>
              <option value="whatsapp">WhatsApp Summary</option>
              <option value="email">Email Correspondence</option>
              <option value="decision">Key Decision / Approval</option>
              <option value="note">Internal Account Note</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Occurred On
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={occurredAtDate}
                onChange={(e) => setOccurredAtDate(e.target.value)}
                className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <input
                type="time"
                value={occurredAtTime}
                onChange={(e) => setOccurredAtTime(e.target.value)}
                className="w-24 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Interaction Summary & Action Items *
          </label>
          <Textarea
            required
            rows={4}
            placeholder="Summarize what was discussed, agreements reached, scope changes, or next steps..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save to Timeline
          </Button>
        </div>
      </form>
    </Modal>
  );
}
