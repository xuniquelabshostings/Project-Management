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
  Globe,
  AlertTriangle,
  MessageCircle,
  Loader2,
  Trash2,
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
import {
  getLocalClients,
  saveLocalClient,
  deleteLocalClient,
  getDeletedClientIds,
  isValidUuid,
} from "@/lib/mock-data";
import { sendClientWhatsAppRenewalAlert } from "@/lib/renewal-alert";

function getClientRenewalAlert(client: Client) {
  const alertDays = client.renewal_alert_days || 30;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const check = (dateStr: string | null | undefined, label: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: `${label} expired`, expired: true };
    }
    if (diffDays <= alertDays) {
      return { text: `${label} in ${diffDays}d`, expired: false };
    }
    return null;
  };

  return check(client.domain_renew_at, "Domain") || check(client.hosting_renew_at, "Hosting");
}

export default function ClientsPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLeadSource, setSelectedLeadSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [mobilePipelineStage, setMobilePipelineStage] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [alertingClientId, setAlertingClientId] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*, account_manager:profiles(*), contacts(*)")
        .order("created_at", { ascending: false });

      const deleted = getDeletedClientIds();
      if (data && data.length > 0) {
        const nonDeletedData = (data as Client[]).filter((c) => !deleted.has(c.id));
        const localCustom = getLocalClients().filter((c) => (c.id.includes("-local") || !isValidUuid(c.id)) && !deleted.has(c.id));
        const combined = [
          ...localCustom.filter((lc) => !nonDeletedData.some((d) => d.id === lc.id)),
          ...nonDeletedData,
        ];
        setClients(combined);
      } else {
        setClients(getLocalClients());
      }
    } catch (err: any) {
      console.warn("Failed to fetch clients, using local store:", err.message);
      setClients(getLocalClients());
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (
    e: React.MouseEvent,
    clientId: string,
    clientName: string
  ) => {
    e.stopPropagation();
    if (
      !confirm(
        `Are you sure you want to delete "${clientName}"?\n\nThis will permanently remove the client and all associated projects, invoices, and contacts.`
      )
    ) {
      return;
    }

    deleteLocalClient(clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));

    if (isValidUuid(clientId)) {
      try {
        await supabase.from("clients").delete().eq("id", clientId);
      } catch (err: any) {
        console.warn("Could not delete client from Supabase:", err.message);
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const clientDisplayName = c.client_name || c.company_name || "";
      const matchesSearch =
        clientDisplayName.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.domain_name && c.domain_name.toLowerCase().includes(q)) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q))) ||
        (c.contacts &&
          c.contacts.some(
            (ct) =>
              ct.name.toLowerCase().includes(q) ||
              (ct.email && ct.email.toLowerCase().includes(q)) ||
              (ct.phone && ct.phone.toLowerCase().includes(q))
          ));

      const matchesStatus =
        selectedStatus === "all" || c.status === selectedStatus;

      const matchesLeadSource =
        selectedLeadSource === "all" || c.lead_source === selectedLeadSource;

      return matchesSearch && matchesStatus && matchesLeadSource;
    });
  }, [clients, searchQuery, selectedStatus, selectedLeadSource]);

  const pipelineStages: { id: ClientStatus; label: string }[] = [
    { id: "lead", label: "Lead Inbound" },
    { id: "negotiation", label: "Proposal / Neg." },
    { id: "active", label: "Active Project" },
    { id: "on_hold", label: "On Hold" },
    { id: "churned", label: "Completed / Churned" },
  ];

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    // 1. Optimistic update in state & localStorage
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, status: newStatus, updated_at: new Date().toISOString() };
          saveLocalClient(updated);
          return updated;
        }
        return c;
      })
    );

    // 2. Sync to Supabase if valid UUID
    try {
      if (isValidUuid(clientId)) {
        await supabase
          .from("clients")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", clientId);
      }
    } catch (err: any) {
      console.warn("Could not sync status to Supabase:", err.message);
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
            <div>
              {/* Desktop Table View */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lead Source</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => {
                        const renewalAlert = getClientRenewalAlert(client);
                        return (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/clients/view?id=${client.id}`}
                                  className="font-medium text-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
                                >
                                  <span>{client.client_name || client.company_name}</span>
                                  <ArrowRight className="w-3 h-3 text-muted" />
                                </Link>
                                {renewalAlert && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded-full border ${
                                      renewalAlert.expired
                                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                    }`}
                                    title={`Renewal Alert: ${renewalAlert.text}`}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    {renewalAlert.text}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {client.domain_name && (
                                  <span className="text-[11px] text-muted flex items-center gap-1 font-mono">
                                    <Globe className="w-2.5 h-2.5 text-accent" />
                                    {client.domain_name}
                                  </span>
                                )}
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
                            <div className="flex items-center justify-end gap-1.5">
                              {renewalAlert && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={alertingClientId === client.id}
                                  className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-500/30 dark:hover:bg-emerald-950/30 font-medium px-2"
                                  onClick={async () => {
                                    setAlertingClientId(client.id);
                                    try {
                                      const res = await sendClientWhatsAppRenewalAlert(client, client.contacts, true);
                                      if (res.updatedClient) {
                                        setClients((prev) =>
                                          prev.map((c) => (c.id === client.id ? res.updatedClient! : c))
                                        );
                                      }
                                    } finally {
                                      setAlertingClientId(null);
                                    }
                                  }}
                                  title="Auto-fetch phone & live WHOIS and send WhatsApp reminder"
                                >
                                  {alertingClientId === client.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                  ) : (
                                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                                  )}
                                  <span className="hidden md:inline ml-1">
                                    {alertingClientId === client.id ? "WHOIS..." : "WhatsApp"}
                                  </span>
                                </Button>
                              )}
                              <Link href={`/clients/view?id=${client.id}`}>
                                <Button variant="ghost" size="sm" className="text-xs h-7">
                                  Open Profile
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 text-muted hover:text-danger hover:bg-danger-bg px-2"
                                onClick={(e) =>
                                  handleDeleteClient(
                                    e,
                                    client.id,
                                    client.client_name || client.company_name || "Client"
                                  )
                                }
                                title="Delete client"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">
                {filteredClients.map((client) => {
                  const renewalAlert = getClientRenewalAlert(client);
                  return (
                    <div
                      key={client.id}
                      className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/clients/view?id=${client.id}`}
                            className="font-medium text-foreground hover:text-accent text-sm flex items-center gap-1 leading-snug"
                          >
                            <span>{client.client_name || client.company_name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
                          </Link>
                          {client.domain_name && (
                            <p className="text-[11px] text-muted font-mono flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3 text-accent shrink-0" />
                              {client.domain_name}
                            </p>
                          )}
                        </div>
                        <ClientStatusBadge status={client.status} />
                      </div>

                      {renewalAlert && (
                        <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {renewalAlert.text}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={alertingClientId === client.id}
                            className="text-[11px] h-6 px-2 text-emerald-600 border-emerald-500/30"
                            onClick={async () => {
                              setAlertingClientId(client.id);
                              try {
                                const res = await sendClientWhatsAppRenewalAlert(client, client.contacts, true);
                                if (res.updatedClient) {
                                  setClients((prev) =>
                                    prev.map((c) => (c.id === client.id ? res.updatedClient! : c))
                                  );
                                }
                              } finally {
                                setAlertingClientId(null);
                              }
                            }}
                          >
                            {alertingClientId === client.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <MessageCircle className="w-3 h-3" />
                            )}
                            <span className="ml-1">WhatsApp</span>
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted text-[11px]">
                          {client.contacts?.[0]?.name ? `Contact: ${client.contacts[0].name}` : "No contact"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link href={`/clients/view?id=${client.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                              View Profile
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-muted hover:text-danger hover:bg-danger-bg"
                            onClick={(e) =>
                              handleDeleteClient(
                                e,
                                client.id,
                                client.client_name || client.company_name || "Client"
                              )
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Pipeline Board View */
            <div className="space-y-4">
              {/* Mobile Stage Switcher Pills */}
              <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setMobilePipelineStage("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    mobilePipelineStage === "all"
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "bg-surface border border-border text-muted hover:text-foreground"
                  }`}
                >
                  All ({filteredClients.length})
                </button>
                {pipelineStages.map((stage) => {
                  const count = filteredClients.filter((c) => c.status === stage.id).length;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setMobilePipelineStage(stage.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        mobilePipelineStage === stage.id
                          ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                          : "bg-surface border border-border text-muted hover:text-foreground"
                      }`}
                    >
                      <span>{stage.label}</span>
                      <span className="font-mono text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {pipelineStages.map((stage) => {
                  const stageClients = filteredClients.filter(
                    (c) => c.status === stage.id
                  );
                  const isHiddenOnMobile =
                    mobilePipelineStage !== "all" && mobilePipelineStage !== stage.id;

                  return (
                    <div
                      key={stage.id}
                      className={`rounded-lg border border-border bg-surface-elevated/40 p-3 min-w-[220px] flex-col ${
                        isHiddenOnMobile ? "hidden sm:flex" : "flex"
                      }`}
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
                          stageClients.map((c) => {
                            const alert = getClientRenewalAlert(c);
                            return (
                            <div
                              key={c.id}
                              className="p-3 rounded-md border border-border bg-surface hover:border-accent/40 shadow-xs transition-colors space-y-2"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <Link
                                  href={`/clients/view?id=${c.id}`}
                                  className="text-xs font-semibold text-foreground hover:text-accent line-clamp-1"
                                >
                                  {c.client_name || c.company_name}
                                </Link>
                                {alert && (
                                  <span
                                    className={`shrink-0 text-[9px] font-medium px-1.5 py-0.2 rounded-full border ${
                                      alert.expired
                                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                    }`}
                                    title={alert.text}
                                  >
                                    {alert.text}
                                  </span>
                                )}
                              </div>

                              {c.domain_name && (
                                <p className="text-[10px] text-muted font-mono truncate flex items-center gap-1">
                                  <Globe className="w-2.5 h-2.5 text-accent shrink-0" />
                                  {c.domain_name}
                                </p>
                              )}

                              {c.industry && (
                                <p className="text-[11px] text-muted line-clamp-1">
                                  {c.industry}
                                </p>
                              )}

                              {alert && (
                                <button
                                  type="button"
                                  disabled={alertingClientId === c.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setAlertingClientId(c.id);
                                    try {
                                      const res = await sendClientWhatsAppRenewalAlert(c, c.contacts, true);
                                      if (res.updatedClient) {
                                        setClients((prev) =>
                                          prev.map((item) => (item.id === c.id ? res.updatedClient! : item))
                                        );
                                      }
                                    } finally {
                                      setAlertingClientId(null);
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-medium transition-colors disabled:opacity-60"
                                  title="Auto-fetch phone & live WHOIS and send WhatsApp reminder"
                                >
                                  {alertingClientId === c.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <MessageCircle className="w-3 h-3" />
                                  )}
                                  <span>{alertingClientId === c.id ? "WHOIS..." : "WhatsApp Alert"}</span>
                                </button>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                                <span className="text-muted truncate max-w-[90px]">
                                  {c.account_manager?.full_name?.split(" ")[0] || "Unassigned"}
                                </span>

                                <div className="flex items-center gap-1">
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
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleDeleteClient(
                                        e,
                                        c.id,
                                        c.client_name || c.company_name || "Client"
                                      )
                                    }
                                    className="p-1 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                                    title="Delete Client"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ClientModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={(savedClient) => {
            saveLocalClient(savedClient);
            setClients((prev) => [savedClient, ...prev.filter((c) => c.id !== savedClient.id)]);
          }}
        />
      </RoleGate>
    </DashboardLayout>
  );
}
