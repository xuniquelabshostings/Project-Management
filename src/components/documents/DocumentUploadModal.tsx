"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document, Client, Project } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { uploadFileToCloudinary } from "@/lib/upload";
import { UploadCloud, CheckCircle2, FileText, Loader2, X } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [uploadedBytes, setUploadedBytes] = useState<number | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadScope() {
      try {
        const [cRes, pRes] = await Promise.all([
          supabase.from("clients").select("*").order("company_name", { ascending: true }),
          supabase.from("projects").select("id, name, client_id"),
        ]);
        if (cRes.data) setClients(cRes.data as Client[]);
        if (pRes.data) setProjects(pRes.data as Project[]);
      } catch (err: any) {
        console.warn("Could not load scope for document upload:", err.message);
      }
    }
    if (isOpen) loadScope();
  }, [isOpen]);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultClientId, defaultProjectId]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setErrorMsg(null);

    try {
      if (!fileName.trim()) {
        setFileName(file.name);
      }

      const uploadRes = await uploadFileToCloudinary(file, "xunique-management/documents");
      setFilePath(uploadRes.secure_url);
      setUploadedBytes(uploadRes.bytes);
      if (!fileName.trim()) {
        setFileName(uploadRes.original_filename || file.name);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file to Cloudinary.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setErrorMsg(null);

    try {
      if (!fileName.trim()) {
        setFileName(file.name);
      }

      const uploadRes = await uploadFileToCloudinary(file, "xunique-management/documents");
      setFilePath(uploadRes.secure_url);
      setUploadedBytes(uploadRes.bytes);
      if (!fileName.trim()) {
        setFileName(uploadRes.original_filename || file.name);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file to Cloudinary.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleClearUploadedFile = () => {
    setFilePath("");
    setUploadedBytes(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      setUploadedBytes(null);
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
      description="Store contract files, SOWs, architecture briefs, or client deliverables via Cloudinary."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        {/* Cloudinary File Dropzone */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Document File (Upload to Cloudinary)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelected}
            className="hidden"
          />

          {!filePath && !isUploadingFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent/60 bg-surface hover:bg-surface-elevated/60 transition-colors rounded-lg p-6 text-center cursor-pointer group"
            >
              <UploadCloud className="w-8 h-8 text-muted group-hover:text-accent mx-auto mb-2 transition-colors" />
              <p className="text-xs font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-[11px] text-muted mt-1">
                PDF, DOCX, XLSX, Images, ZIP up to 25MB (Securely hosted on Cloudinary CDN)
              </p>
            </div>
          ) : isUploadingFile ? (
            <div className="border border-border bg-surface rounded-lg p-6 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 text-accent animate-spin mb-2" />
              <p className="text-xs font-medium text-foreground">
                Uploading to Cloudinary...
              </p>
              <p className="text-[11px] text-muted mt-0.5">Please wait a moment</p>
            </div>
          ) : (
            <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {fileName || "Uploaded File"}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    Cloudinary CDN • {uploadedBytes ? `${(uploadedBytes / 1024).toFixed(1)} KB` : "Stored"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearUploadedFile}
                className="text-muted hover:text-danger h-7 w-7 p-0 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

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
                {c.client_name || c.company_name}
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
            Document Title / Display Name *
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
            Cloudinary / File Storage URL
          </label>
          <Input
            placeholder="https://res.cloudinary.com/..."
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
              Sensitive documents are restricted to Administrators and Account Managers.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading || isUploadingFile}>
            Register Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
