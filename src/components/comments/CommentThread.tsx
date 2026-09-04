"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2, Clock, User, AtSign } from "lucide-react";
import { Comment, Profile } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface CommentThreadProps {
  projectId?: string;
  taskId?: string;
}

export function CommentThread({ projectId, taskId }: CommentThreadProps) {
  const { profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<Profile[]>([]);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommentsAndTeam = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("comments")
        .select("*, author:profiles(*)")
        .order("created_at", { ascending: true });

      if (taskId) {
        query = query.eq("task_id", taskId);
      } else if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const [commentsRes, teamRes] = await Promise.all([
        query,
        supabase.from("profiles").select("*"),
      ]);

      if (commentsRes.data) setComments(commentsRes.data as Comment[]);
      if (teamRes.data) setTeamProfiles(teamRes.data as Profile[]);
    } catch (err: any) {
      console.warn("Failed to load comments:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsAndTeam();
  }, [projectId, taskId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !profile) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          author_id: profile.id,
          project_id: projectId || null,
          task_id: taskId || null,
          body: body.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*, author:profiles(*)")
        .single();

      if (error) throw error;

      // Scan for @mentions and notify mentioned users
      const words = body.split(/\s+/);
      const mentionedEmailsOrNames = words
        .filter((w) => w.startsWith("@"))
        .map((w) => w.slice(1).toLowerCase());

      if (mentionedEmailsOrNames.length > 0) {
        for (const target of mentionedEmailsOrNames) {
          const matchedProfile = teamProfiles.find(
            (p) =>
              p.email.toLowerCase().includes(target) ||
              p.full_name.toLowerCase().replace(/\s+/g, "").includes(target)
          );

          if (matchedProfile && matchedProfile.id !== profile.id) {
            await supabase.from("notifications").insert({
              user_id: matchedProfile.id,
              title: `${profile.full_name || "A team member"} mentioned you`,
              message: body.slice(0, 120),
              link: projectId ? `/projects/view?id=${projectId}` : "/tasks",
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      setComments((prev) => [...prev, data as Comment]);
      setBody("");
    } catch (err: any) {
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <MessageSquare className="w-4 h-4 text-accent" />
        <h4 className="font-serif text-sm font-semibold text-foreground">
          Internal Team Discussion ({comments.length})
        </h4>
        <span className="text-[10px] text-muted font-mono ml-auto">
          Internal only &bull; Never visible to clients
        </span>
      </div>

      {/* Comments feed */}
      {isLoading ? (
        <div className="py-4 text-center text-xs text-muted">
          Loading discussion thread...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-border/60 rounded-md bg-surface-elevated/30">
          <p className="text-xs text-muted">No comments yet.</p>
          <p className="text-[11px] text-muted/70 mt-0.5">
            Use @name to notify team members directly.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isMe = comment.author_id === profile?.id;
            const isAdmin = profile?.role === "admin";

            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-lg border border-border bg-surface text-xs space-y-1.5 group transition-colors hover:border-border/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
                      {comment.author?.full_name?.charAt(0) || "U"}
                    </div>
                    <span className="font-medium text-foreground">
                      {comment.author?.full_name || "Team Member"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted">
                    <span className="font-mono text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {(isMe || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted hover:text-danger transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed pl-8">
                  {comment.body}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Post comment form */}
      <form onSubmit={handlePostComment} className="space-y-2 pt-2">
        <Textarea
          rows={2}
          placeholder="Write internal note or comment... Use @name to mention"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="text-xs"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-muted">
            <AtSign className="w-3 h-3 text-accent" />
            <span>Mention team members</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!body.trim()}
            className="text-xs h-7 px-3"
          >
            <Send className="w-3 h-3 mr-1" /> Comment
          </Button>
        </div>
      </form>
    </div>
  );
}
