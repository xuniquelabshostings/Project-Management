"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderOpen,
  FileText,
  Plus,
  Search,
  Lock,
  Download,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import { Document, Client } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { getLocalClients } from "@/lib/mock-data";

function DocumentsContent() {
  const searchParams = useSearchParams();
  const filterClientId = searchParams.get("clientId") || "all";
  const { profile } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>(() =>
    typeof window !== "undefined" ? getLocalClients() : []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>(filterClientId);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);

      const [docsRes, clientsRes] = await Promise.all([
        supabase
          .from("documents")
          .select("*, uploader:profiles(*)")
          .order("created_at", { ascending: false }),
        supabase.from("clients").select("id, company_name").order("company_name", { ascending: true }),
      ]);

      if (docsRes.data) setDocuments(docsRes.data as Document[]);
      const localList = getLocalClients();
      if (clientsRes.data && clientsRes.data.length > 0) {
        const custom = localList.filter((c) => !clientsRes.data!.some((d) => d.id === c.id));
        setClients([...custom, ...(clientsRes.data as Client[])]);
      } else {
        setClients(localList);
      }
    } catch (err: any) {
      console.warn("Failed to load documents:", err.message);
      setClients(getLocalClients());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = d.file_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = selectedClient === "all" || d.client_id === selectedClient;
      return matchesSearch && matchesClient;
    });
  }, [documents, searchQuery, selectedClient]);

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document record?")) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", docId);
      if (error) throw error;
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
            Document Repository
          </h1>
          <p className="text-sm text-muted mt-1">
            Central repository for client contracts, statements of work, and project assets
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Register Document
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.client_name || c.company_name}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted">
          Loading documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
          <FolderOpen className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No documents found</p>
          <p className="text-xs text-muted mt-1">
            {searchQuery || selectedClient !== "all"
              ? "Try adjusting your search query or client filter."
              : "Register your first contract, SOW, or project asset."}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Document
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Confidentiality</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => {
                  const isUploader = doc.uploaded_by === profile?.id;
                  const isAdmin = profile?.role === "admin";

                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {doc.file_name}
                            </p>
                            <span className="text-[10px] text-muted font-mono">
                              v{doc.version} &bull; {doc.storage_path}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {doc.is_sensitive ? (
                          <Badge variant="danger" className="text-[10px] flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" /> Confidential
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] w-fit">
                            General Team
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-foreground">
                        {doc.uploader?.full_name || "Team Member"}
                      </TableCell>

                      <TableCell className="text-xs text-muted font-mono">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.storage_path && (
                            <a
                              href={doc.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                              title="Open Document URL"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {(isUploader || isAdmin) && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => fetchDocs()}
      />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted">
            Loading repository...
          </div>
        }
      >
        <DocumentsContent />
      </Suspense>
    </DashboardLayout>
  );
}
