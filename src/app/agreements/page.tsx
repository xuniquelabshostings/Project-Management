"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileSignature,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Shield,
  Edit2,
  Trash2,
  ExternalLink,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Agreement, AgreementStatus, Client } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import {
  getLocalAgreements,
  saveLocalAgreement,
  deleteLocalAgreement,
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";
import { AgreementModal } from "@/components/agreements/AgreementModal";
import { AgreementPrintModal } from "@/components/agreements/AgreementPrintModal";

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<Agreement | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch clients directly from Supabase
      const { data: dbClients } = await supabase
        .from("clients")
        .select("*")
        .order("company_name", { ascending: true });

      setClients((dbClients as Client[]) || []);

      // Fetch agreements (from agreement storage)
      const localList = getLocalAgreements();
      setAgreements(localList);
    } catch (err) {
      console.warn("Error loading agreements data:", err);
      setAgreements(getLocalAgreements());
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAgreements = useMemo(() => {
    return agreements.filter((agr) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        agr.agreement_number.toLowerCase().includes(q) ||
        agr.project_name.toLowerCase().includes(q) ||
        agr.title.toLowerCase().includes(q) ||
        ((agr.client?.client_name || agr.client?.company_name) &&
          (agr.client.client_name || agr.client.company_name)!.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || agr.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agreements, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalValue = agreements.reduce((acc, a) => acc + (a.total_fee || 0), 0);
    const active = agreements.filter((a) => a.status === "active").length;
    const signed = agreements.filter((a) => a.status === "signed").length;
    const draft = agreements.filter((a) => a.status === "draft").length;
    return { total: agreements.length, totalValue, active, signed, draft };
  }, [agreements]);

  const handleSaveAgreement = (saved: Agreement) => {
    const updatedList = saveLocalAgreement(saved);
    setAgreements(updatedList);
  };

  const handleDeleteAgreement = (id: string, number: string) => {
    if (!window.confirm(`Are you sure you want to delete agreement ${number}?`)) return;
    const updatedList = deleteLocalAgreement(id);
    setAgreements(updatedList);
  };

  const getStatusBadge = (status: AgreementStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        );
      case "signed":
        return (
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
            Signed
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Sent
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
            Completed
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
            Draft
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
              <FileSignature className="w-6 h-6 text-accent" />
              Software Developer Agreements
            </h1>
            <p className="text-sm text-muted mt-1">
              Generate client-ready developer agreements with standard agency terms, statutory non-GST disclosures, and complete liability shields.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAgreement(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Agreement
          </Button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                Total Agreements
              </span>
              <p className="text-2xl font-bold font-serif text-foreground mt-1">{stats.total}</p>
              <span className="text-[11px] text-muted">Across all clients</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                Active / In Progress
              </span>
              <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.active}</p>
              <span className="text-[11px] text-muted">Ongoing engineering</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                Signed Contracts
              </span>
              <p className="text-2xl font-bold font-serif text-sky-700 mt-1">{stats.signed}</p>
              <span className="text-[11px] text-muted">Legally executed</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                Total Contracted Value
              </span>
              <p className="text-xl font-bold font-mono text-foreground mt-1">
                {formatINR(stats.totalValue)}
              </p>
              <span className="text-[11px] text-muted">100% Pure Service Fees</span>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Input
              type="text"
              placeholder="Search agreement, project, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Agreement #</TableHead>
                  <TableHead>Client &amp; Project</TableHead>
                  <TableHead>Contract Fee</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted text-xs">
                      Loading agreements...
                    </TableCell>
                  </TableRow>
                ) : filteredAgreements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted">
                      <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted" />
                      <p className="text-sm font-medium text-foreground">No agreements found</p>
                      <p className="text-xs text-muted mt-0.5">
                        {searchQuery || statusFilter !== "all"
                          ? "Try modifying your search or status filter."
                          : "Generate your first client agreement with standard legal protection terms."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAgreement(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="mt-4 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Generate Agreement
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgreements.map((agr) => (
                    <TableRow key={agr.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {agr.agreement_number}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">
                          {agr.project_name}
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-muted" />
                          <span>{agr.client?.client_name || agr.client?.company_name || "Unassigned Client"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {formatINR(agr.total_fee)}
                      </TableCell>

                      <TableCell className="text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted" />
                          <span>
                            {new Date(agr.effective_date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(agr.status)}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedForPrint(agr)}
                            className="h-8 px-2.5 text-xs text-foreground"
                            title="View, Print & Export PDF"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1 text-muted" />
                            Print / PDF
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAgreement(agr);
                              setIsCreateModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-muted hover:text-foreground"
                            title="Edit Agreement Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAgreement(agr.id, agr.agreement_number)}
                            className="h-8 w-8 p-0 text-muted hover:text-danger"
                            title="Delete Agreement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create / Edit Modal */}
        <AgreementModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingAgreement(null);
          }}
          onSave={handleSaveAgreement}
          clients={clients}
          initialData={editingAgreement}
          existingAgreements={agreements}
        />

        {/* Print / PDF Document Modal */}
        <AgreementPrintModal
          isOpen={!!selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
          agreement={selectedForPrint}
        />
      </div>
    </DashboardLayout>
  );
}
