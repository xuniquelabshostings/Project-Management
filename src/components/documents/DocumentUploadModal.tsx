"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document, Client, Project } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (doc: Document) => void;
  defaultClientId?: string;
  defaultProjectId?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUploaded,
  defaultClientId,
  defaultProjectId,
}: DocumentUploadModalProps) {
  const { profile } = useAuth();
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [isSensitive, setIsSensitive] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadScope() {
      const [cRes, pRes] = await Promise.all([
        supabase.from("clients").select("id, company_name"),
        supabase.from("projects").select("id, name, client_id"),
      ]);
      if (cRes.data) setClients(cRes.data as Client[]);
      if (pRes.data) setProjects(pRes.data as Project[]);
    }
    if (isOpen) loadScope();
  }, [isOpen]);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultClientId, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setErrorMsg("Document title/name is required.");
      return;
    }
    if (!clientId) {
      setErrorMsg("Please associate this document with a client.");
      return;
    }
    if (!profile) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          client_id: clientId,
          project_id: projectId || null,
          file_name: fileName.trim(),
          storage_path: filePath.trim() || `documents/${Date.now()}_${fileName.trim()}`,
          is_sensitive: isSensitive,
          uploaded_by: profile.id,
          version: 1,
          created_at: new Date().toISOString(),
        })
        .select("*, uploader:profiles(*)")
        .single();

      if (error) throw error;
      onUploaded(data as Document);
      setFileName("");
      setFilePath("");
      setIsSensitive(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register document.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) => !clientId || p.client_id === clientId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload / Register Document"
      description="Store contract files, SOWs, architecture briefs, or client credentials."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Client Account *
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId("");
            }}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Associated Project (Optional)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="">None / General Client Document</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Document Title / File Name *
          </label>
          <Input
            required
            placeholder="e.g. Master Services Agreement v1.2.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Cloud Storage Path or File URL
          </label>
          <Input
            placeholder="https://drive.google.com/... or supabase/bucket/path"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />
        </div>

        <div className="p-3 rounded-md bg-surface-elevated border border-border flex items-start gap-2.5">
          <input
            type="checkbox"
            id="sensitive-doc-toggle"
            checked={isSensitive}
            onChange={(e) => setIsSensitive(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent mt-0.5"
          />
          <div>
            <label
              htmlFor="sensitive-doc-toggle"
              className="text-xs font-medium text-foreground cursor-pointer block"
            >
              Mark as Sensitive / Confidential
            </label>
            <p className="text-[11px] text-muted mt-0.5">
              Sensitive documents (such as master contracts and credentials) are restricted to Administrators and Account Managers.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Register Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
