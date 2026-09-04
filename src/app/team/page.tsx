"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, UserPlus, Shield, Mail, Phone, MoreHorizontal, Check, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { supabase } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/types/database.types";
import { useAuth } from "@/providers/AuthProvider";

export default function TeamPage() {
  const { profile: currentProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("developer");
  const [inviteStatus, setInviteStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProfiles(data as Profile[]);
    } catch (err) {
      console.warn("Failed to fetch team members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        alert(`Failed to update role: ${error.message}`);
        return;
      }

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      );
    } catch (e: any) {
      alert(`Error updating role: ${e.message}`);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInviteStatus(null);

    try {
      // In Supabase client with public anon key, admin invitations are typically done via:
      // 1. Supabase Edge Function with service_role key OR
      // 2. Direct insert/invite if edge function is configured.
      // We also provide a direct user creation helper/instruction.
      setInviteStatus({
        message: `Invitation queued for ${inviteEmail} as ${inviteRole}. Make sure to invite them in your Supabase Auth dashboard or configure the invite Edge Function.`,
      });
      setInviteEmail("");
      setInviteFullName("");
      setIsInviteModalOpen(false);
    } catch (err: any) {
      setInviteStatus({
        message: err.message || "Failed to send invitation.",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "danger";
      case "account_manager":
        return "warning";
      case "developer":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <DashboardLayout>
      <RoleGate
        allowedRoles={["admin"]}
        fallback={
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Access Restricted
            </h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Only users with the Administrator role can manage team members and permissions.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                Team & User Permissions
              </h1>
              <p className="text-sm text-muted mt-1">
                Manage team members, organizational roles, and workspace permissions
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Invite Member
            </Button>
          </div>

          {inviteStatus && (
            <div
              className={`p-4 rounded-md text-xs border flex items-center gap-2 ${
                inviteStatus.isError
                  ? "bg-danger-bg text-danger border-danger/20"
                  : "bg-success-bg text-success border-success/20"
              }`}
            >
              {inviteStatus.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{inviteStatus.message}</span>
            </div>
          )}

          {/* Team Members Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Internal Team Members ({profiles.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted">
                  Loading team profiles...
                </div>
              ) : profiles.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted">
                  No team profiles found. When team members sign in, their profiles will appear here.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Assign Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((member) => {
                      const isCurrentUser = member.id === currentProfile?.id;
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                                {member.full_name?.charAt(0) || member.email?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {member.full_name || "Anonymous Member"}{" "}
                                  {isCurrentUser && (
                                    <span className="text-[10px] text-muted font-normal">
                                      (You)
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted font-mono">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role.replace("_", " ")}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs text-muted font-mono">
                            {new Date(member.created_at).toLocaleDateString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <select
                              value={member.role}
                              disabled={isCurrentUser}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value as UserRole)
                              }
                              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                            >
                              <option value="developer">Developer</option>
                              <option value="account_manager">Account Manager</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Roles Reference Card */}
          <Card className="bg-surface-elevated/40 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Team Roles & Access Levels</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-surface border border-border/40">
                  <span className="font-semibold text-foreground block mb-1">
                    Administrator
                  </span>
                  <p>
                    Full access across all modules: every client, every project, all financials,
                    invoices, documents, and team permission assignments.
                  </p>
                </div>
                <div className="p-3 rounded-md bg-surface border border-border/40">
                  <span className="font-semibold text-foreground block mb-1">
                    Account Manager
                  </span>
                  <p>
                    Access to clients and projects assigned to them. Can create and view invoices
                    for their assigned clients. Cannot access other AMs' data.
                  </p>
                </div>
                <div className="p-3 rounded-md bg-surface border border-border/40">
                  <span className="font-semibold text-foreground block mb-1">
                    Developer / Team Member
                  </span>
                  <p>
                    Restricted strictly to assigned projects, tasks, and task comments. Cannot
                    view client financials, invoices, or client-level data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite User Modal */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Internal Team Member"
          description="Send an invitation to join the Xunique Labs internal management workspace."
        >
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                required
                placeholder="Alex Morgan"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="alex@xuniquelabs.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Initial Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="developer">Developer (Tasks & Assigned Projects only)</option>
                <option value="account_manager">
                  Account Manager (Assigned Clients & Invoicing)
                </option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Invite Member
              </Button>
            </div>
          </form>
        </Modal>
      </RoleGate>
    </DashboardLayout>
  );
}
