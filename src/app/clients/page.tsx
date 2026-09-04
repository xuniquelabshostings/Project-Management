"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Filter,
  Columns,
  List as ListIcon,
  ExternalLink,
  Building2,
  Tag,
  ArrowRight,
  Shield,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { Client, ClientStatus, LeadSource } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_CLIENTS } from "@/lib/mock-data";

export default function ClientsPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLeadSource, setSelectedLeadSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*, account_manager:profiles(*), contacts(*)")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setClients(data as Client[]);
      } else {
        const isDemo = typeof window !== "undefined" && localStorage.getItem("xunique_demo_session_role");
        if (isDemo || !data || data.length === 0) {
          setClients(MOCK_CLIENTS);
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch clients, using fallback data:", err.message);
      setClients(MOCK_CLIENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus =
        selectedStatus === "all" || c.status === selectedStatus;

      const matchesSource =
        selectedLeadSource === "all" || c.lead_source === selectedLeadSource;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [clients, searchQuery, selectedStatus, selectedLeadSource]);

  const pipelineStages: { id: ClientStatus; label: string }[] = [
    { id: "lead", label: "Lead" },
    { id: "negotiation", label: "Negotiation" },
    { id: "active", label: "Active" },
    { id: "on_hold", label: "On Hold" },
    { id: "churned", label: "Past / Churned" },
  ];

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", clientId);

      if (error) throw error;
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <DashboardLayout>
      <RoleGate
        allowedRoles={["admin", "account_manager"]}
        fallback={
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Access Restricted
            </h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Client and account data is restricted to Administrators and Account Managers.
              Developers access projects and tasks assigned to them directly.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                Client & Account Management
              </h1>
              <p className="text-sm text-muted mt-1">
                Internal client profiles, contacts, pipeline stages, and interaction records
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Switcher */}
              <div className="flex items-center border border-border rounded-md bg-surface p-0.5 text-xs">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-surface-elevated text-foreground font-medium shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                  title="List Table View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode("pipeline")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    viewMode === "pipeline"
                      ? "bg-surface-elevated text-foreground font-medium shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                  title="Pipeline Board View"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Client
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Search clients, industries, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Stages</option>
                <option value="lead">Lead</option>
                <option value="negotiation">Negotiation</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="churned">Past / Churned</option>
              </select>

              <select
                value={selectedLeadSource}
                onChange={(e) => setSelectedLeadSource(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Lead Sources</option>
                <option value="referral">Referral</option>
                <option value="upwork">Upwork</option>
                <option value="linkedin">LinkedIn</option>
                <option value="inbound">Inbound</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* View Content */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading clients directory...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
              <Building2 className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No clients found</p>
              <p className="text-xs text-muted mt-1">
                {searchQuery || selectedStatus !== "all"
                  ? "Try resetting your search or stage filters."
                  : "Start by registering your first client account."}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Client
              </Button>
            </div>
          ) : viewMode === "list" ? (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lead Source</TableHead>
                      <TableHead>Account Manager</TableHead>
                      <TableHead>Contacts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/clients/view?id=${client.id}`}
                              className="font-medium text-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
                            >
                              <span>{client.company_name}</span>
                              <ArrowRight className="w-3 h-3 text-muted" />
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              {client.industry && (
                                <span className="text-xs text-muted">
                                  {client.industry}
                                </span>
                              )}
                              {client.tags && client.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {client.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] bg-surface-elevated text-muted px-1.5 py-0.2 rounded border border-border"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <ClientStatusBadge status={client.status} />
                        </TableCell>

                        <TableCell className="text-xs text-muted capitalize font-mono">
                          {client.lead_source || "—"}
                        </TableCell>

                        <TableCell className="text-xs text-foreground">
                          {client.account_manager?.full_name || (
                            <span className="text-muted italic">Unassigned</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted">
                          {client.contacts && client.contacts.length > 0 ? (
                            <span>
                              {client.contacts[0].name}{" "}
                              {client.contacts.length > 1 && (
                                <span className="text-[10px] text-muted font-mono">
                                  (+{client.contacts.length - 1} more)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="italic">No contacts</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Link href={`/clients/view?id=${client.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              Open Profile
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            /* Pipeline Board View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => {
                const stageClients = filteredClients.filter(
                  (c) => c.status === stage.id
                );

                return (
                  <div
                    key={stage.id}
                    className="rounded-lg border border-border bg-surface-elevated/40 p-3 min-w-[220px] flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                      <span className="text-xs font-semibold text-foreground">
                        {stage.label}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                        {stageClients.length}
                      </span>
                    </div>

                    {/* Cards in stage */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                      {stageClients.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted/60 border border-dashed border-border/40 rounded-md">
                          No clients in this stage
                        </div>
                      ) : (
                        stageClients.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-md border border-border bg-surface hover:border-accent/40 shadow-xs transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <Link
                                href={`/clients/view?id=${c.id}`}
                                className="text-xs font-semibold text-foreground hover:text-accent line-clamp-1"
                              >
                                {c.company_name}
                              </Link>
                            </div>

                            {c.industry && (
                              <p className="text-[11px] text-muted line-clamp-1">
                                {c.industry}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                              <span className="text-muted truncate max-w-[90px]">
                                {c.account_manager?.full_name?.split(" ")[0] || "Unassigned"}
                              </span>

                              {/* Quick Move Stage */}
                              <select
                                value={c.status}
                                onChange={(e) =>
                                  handleStatusChange(c.id, e.target.value as ClientStatus)
                                }
                                className="bg-surface-elevated border border-border rounded px-1 py-0.5 text-[10px] text-muted hover:text-foreground"
                              >
                                {pipelineStages.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    Move: {st.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ClientModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={(savedClient) => {
            setClients((prev) => [savedClient, ...prev.filter((c) => c.id !== savedClient.id)]);
            fetchClients();
          }}
        />
      </RoleGate>
    </DashboardLayout>
  );
}
