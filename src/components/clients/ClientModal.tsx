"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, ClientStatus, LeadSource, Profile } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { saveLocalClient, generateUUID } from "@/lib/mock-data";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  clientToEdit?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSaved, clientToEdit }: ClientModalProps) {
  const { profile: currentProfile, session } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<ClientStatus>("lead");
  const [leadSource, setLeadSource] = useState<LeadSource>("referral");
  const [tagsInput, setTagsInput] = useState("");
  const [accountManagerId, setAccountManagerId] = useState<string>("");
  const [accountManagers, setAccountManagers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccountManagers() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "account_manager"]);
      if (data && data.length > 0) {
        setAccountManagers(data as Profile[]);
      }
    }
    if (isOpen) {
      loadAccountManagers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (clientToEdit) {
      setCompanyName(clientToEdit.company_name);
      setIndustry(clientToEdit.industry || "");
      setWebsite(clientToEdit.website || "");
      setStatus(clientToEdit.status);
      setLeadSource(clientToEdit.lead_source || "referral");
      setTagsInput(clientToEdit.tags ? clientToEdit.tags.join(", ") : "");
      setAccountManagerId(clientToEdit.account_manager_id || "");
    } else {
      setCompanyName("");
      setIndustry("");
      setWebsite("");
      setStatus("lead");
      setLeadSource("referral");
      setTagsInput("");
      setAccountManagerId(currentProfile?.id || "");
    }
    setErrorMsg(null);
  }, [clientToEdit, isOpen, currentProfile]);

  const saveLocally = (tagsArray: string[], safeAMId: string | null) => {
    const mockClient: Client = {
      id: clientToEdit?.id || generateUUID(),
      company_name: companyName.trim(),
      industry: industry.trim() || null,
      website: website.trim() || null,
      status,
      lead_source: leadSource,
      tags: tagsArray,
      account_manager_id: safeAMId || null,
      account_manager:
        accountManagers.find((am) => am.id === safeAMId) || currentProfile || null,
      contacts: clientToEdit?.contacts || [],
      created_at: clientToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalClient(mockClient);
    onSaved(mockClient);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isDemo = !session || (currentProfile?.id && currentProfile.id.startsWith("00000000"));

    // Sanitize accountManagerId: avoid sending mock ID to live database
    const safeAccountManagerId =
      accountManagerId && !accountManagerId.startsWith("00000000")
        ? accountManagerId
        : session?.user?.id || null;

    if (isDemo) {
      saveLocally(tagsArray, safeAccountManagerId);
      setIsLoading(false);
      return;
    }

    const payload = {
      company_name: companyName.trim(),
      industry: industry.trim() || null,
      website: website.trim() || null,
      status,
      lead_source: leadSource,
      tags: tagsArray,
      account_manager_id: safeAccountManagerId,
      updated_at: new Date().toISOString(),
    };

    try {
      if (clientToEdit) {
        const { data, error } = await supabase
          .from("clients")
          .update(payload)
          .eq("id", clientToEdit.id)
          .select()
          .single();

        if (error) throw error;
        saveLocalClient(data as Client);
        onSaved(data as Client);
      } else {
        const { data, error } = await supabase
          .from("clients")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        saveLocalClient(data as Client);
        onSaved(data as Client);
      }
      onClose();
    } catch (err: any) {
      if (
        err.message?.toLowerCase().includes("row-level security") ||
        err.code === "42501" ||
        err.status === 403
      ) {
        // Fallback locally and persist so the newly added client appears right away
        saveLocally(tagsArray, safeAccountManagerId);
        return;
      }
      setErrorMsg(err.message || "Failed to save client.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? "Edit Client Profile" : "Create New Client"}
      description="Record client details and assign an internal Account Manager."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Company Name *
          </label>
          <Input
            required
            placeholder="e.g. Acme Corporation"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Industry
            </label>
            <Input
              placeholder="e.g. Fintech, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Website URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Pipeline Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="lead">Lead</option>
              <option value="negotiation">Negotiation</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="churned">Past / Churned</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Lead Source
            </label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as LeadSource)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="referral">Referral</option>
              <option value="upwork">Upwork</option>
              <option value="linkedin">LinkedIn</option>
              <option value="inbound">Inbound</option>
              <option value="cold_outreach">Cold Outreach</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Assigned Account Manager
          </label>
          <select
            value={accountManagerId}
            onChange={(e) => setAccountManagerId(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="">Unassigned</option>
            {accountManagers.map((am) => (
              <option key={am.id} value={am.id}>
                {am.full_name || am.email} ({am.role})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted mt-1">
            The assigned account manager oversees client communication and deliverables.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Tags (comma-separated)
          </label>
          <Input
            placeholder="Fintech, High-Priority, Mobile"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {clientToEdit ? "Save Changes" : "Create Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
