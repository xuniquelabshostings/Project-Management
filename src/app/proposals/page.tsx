"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Shield,
  Send,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Proposal, ProposalStatus, Client } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import {
  getLocalClients,
  getLocalProposals,
  saveLocalProposal,
  isValidUuid,
  generateUUID,
} from "@/lib/mock-data";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>(() =>
    typeof window !== "undefined" ? getLocalClients() : []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [status, setStatus] = useState<ProposalStatus>("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProposalsAndClients = async () => {
    try {
      setIsLoading(true);
      const [pRes, cRes] = await Promise.allSettled([
        supabase
          .from("proposals")
          .select("*, client:clients(*)")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, client_name, company_name")
          .order("company_name", { ascending: true }),
      ]);

      const localClients = getLocalClients();
      let mergedClients: Client[] = [...localClients];
      if (cRes.status === "fulfilled" && cRes.value.data && cRes.value.data.length > 0) {
        const remoteClients = cRes.value.data as Client[];
        const customOnly = localClients.filter(
          (c) => !remoteClients.some((d) => d.id === c.id)
        );
        mergedClients = [...customOnly, ...remoteClients];
      }
      setClients(mergedClients);

      const localProposals = getLocalProposals();
      let mergedProposals: Proposal[] = [];
      if (pRes.status === "fulfilled" && pRes.value.data) {
        const remoteProposals = pRes.value.data as Proposal[];
        const remoteIds = new Set(remoteProposals.map((p) => p.id));
        const localOnly = localProposals.filter((p) => !remoteIds.has(p.id));
        mergedProposals = [...remoteProposals, ...localOnly];
      } else {
        mergedProposals = [...localProposals];
      }

      // Attach client references for any proposals lacking it
      mergedProposals = mergedProposals.map((p) => {
        if (!p.client) {
          const matchedClient = mergedClients.find((c) => c.id === p.client_id);
          if (matchedClient) return { ...p, client: matchedClient };
        }
        return p;
      });

      mergedProposals.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setProposals(mergedProposals);
    } catch (err: any) {
      console.warn("Failed to load proposals:", err.message);
      const localProposals = getLocalProposals();
      const localClients = getLocalClients();
      setClients(localClients);
      setProposals(localProposals);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposalsAndClients();
  }, []);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const clientName = p.client?.client_name || p.client?.company_name;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clientName && clientName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchQuery, statusFilter]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title.trim()) {
      setErrorMsg("Please select a client and enter a proposal title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const clientObj = clients.find((c) => c.id === clientId);

    // If client ID is local / non-UUID, save directly to local storage to avoid Postgres UUID syntax errors
    if (!isValidUuid(clientId) || clientId.includes("-local")) {
      const newProposal: Proposal = {
        id: generateUUID(),
        client_id: clientId,
        title: title.trim(),
        content: content.trim(),
        file_url: fileUrl.trim() || null,
        version: 1,
        status,
        template_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: clientObj,
      };

      saveLocalProposal(newProposal);
      setProposals((prev) => [newProposal, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setFileUrl("");
      setClientId("");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("proposals")
        .insert({
          client_id: clientId,
          title: title.trim(),
          content: content.trim(),
          file_url: fileUrl.trim() || null,
          version: 1,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*, client:clients(*)")
        .single();

      if (error) {
        console.warn("Supabase proposal insert error, falling back locally:", error.message);
        const newProposal: Proposal = {
          id: generateUUID(),
          client_id: clientId,
          title: title.trim(),
          content: content.trim(),
          file_url: fileUrl.trim() || null,
          version: 1,
          status,
          template_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: clientObj,
        };
        saveLocalProposal(newProposal);
        setProposals((prev) => [newProposal, ...prev]);
      } else if (data) {
        setProposals((prev) => [data as Proposal, ...prev]);
      }

      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setFileUrl("");
      setClientId("");
    } catch (err: any) {
      console.warn("Supabase catch error creating proposal, saving locally:", err?.message);
      const newProposal: Proposal = {
        id: generateUUID(),
        client_id: clientId,
        title: title.trim(),
        content: content.trim(),
        file_url: fileUrl.trim() || null,
        version: 1,
        status,
        template_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: clientObj,
      };
      saveLocalProposal(newProposal);
      setProposals((prev) => [newProposal, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setFileUrl("");
      setClientId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (proposalId: string, newStatus: ProposalStatus) => {
    // Update local state first
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
          : p
      )
    );

    // If present in local proposals, update it there too
    const local = getLocalProposals();
    const existingLocal = local.find((p) => p.id === proposalId);
    if (existingLocal) {
      saveLocalProposal({
        ...existingLocal,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    }

    if (isValidUuid(proposalId) && !proposalId.includes("-local")) {
      try {
        await supabase
          .from("proposals")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", proposalId);
      } catch (err: any) {
        console.warn("Failed to update status in Supabase:", err.message);
      }
    }
  };

  const getStatusBadge = (st: ProposalStatus) => {
    switch (st) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "viewed":
        return <Badge variant="info">Viewed</Badge>;
      case "sent":
        return <Badge variant="warning">Sent</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
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
              Proposals, quotes, and contract management are restricted to Administrators
              and Account Managers.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                Proposals & Statements of Work
              </h1>
              <p className="text-sm text-muted mt-1">
                Project scoping, versioning, contract deliverables, and signature tracking
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Proposal
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Search proposal title, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Proposal Stages</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Proposals Table */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading proposals...
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
              <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No proposals recorded</p>
              <p className="text-xs text-muted mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try resetting your search filters."
                  : "Draft your first client proposal or SOW."}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Proposal
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proposal Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Stage Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProposals.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-sm text-foreground">
                            {p.title}
                          </div>
                          {p.content && (
                            <p className="text-xs text-muted line-clamp-1 mt-0.5">
                              {p.content}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-foreground font-medium">
                          {p.client?.client_name || p.client?.company_name || "Client"}
                        </TableCell>

                        <TableCell className="text-xs text-muted font-mono">
                          v{p.version}
                        </TableCell>

                        <TableCell>{getStatusBadge(p.status)}</TableCell>

                        <TableCell className="text-xs font-mono text-muted">
                          {new Date(p.created_at).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.file_url && (
                              <a
                                href={p.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-muted hover:text-foreground"
                                title="View Document"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <select
                              value={p.status}
                              onChange={(e) =>
                                handleUpdateStatus(p.id, e.target.value as ProposalStatus)
                              }
                              className="rounded border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="viewed">Viewed</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* New Proposal Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Create Proposal / Statement of Work"
            description="Draft a proposal for client review and signature tracking."
          >
            <form onSubmit={handleCreateProposal} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Client Account *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_name || c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Proposal Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Mobile App Redesign & SOW v1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Summary / Executive Brief
                </label>
                <Textarea
                  rows={3}
                  placeholder="Key deliverables, timeline expectations, terms..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Document / SOW File Link (Optional)
                </label>
                <Input
                  placeholder="https://drive.google.com/... or Supabase storage URL"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Create Proposal
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </RoleGate>
    </DashboardLayout>
  );
}
