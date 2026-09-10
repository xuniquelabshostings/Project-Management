"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, ClientStatus, LeadSource, Profile, Contact } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { isValidUuid, generateUUID } from "@/lib/mock-data";
import {
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  onDeleted?: (clientId: string) => void;
  clientToEdit?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSaved, onDeleted, clientToEdit }: ClientModalProps) {
  const { profile: currentProfile, session } = useAuth();
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<ClientStatus>("lead");
  const [leadSource, setLeadSource] = useState<LeadSource>("referral");
  const [tagsInput, setTagsInput] = useState("");
  const [accountManagerId, setAccountManagerId] = useState<string>("");
  const [accountManagers, setAccountManagers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Primary Contact Details State
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<"whatsapp" | "email" | "phone" | "other">("whatsapp");

  useEffect(() => {
    async function loadAMs() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("full_name", { ascending: true });
        if (data && data.length > 0) {
          setAccountManagers(data as Profile[]);
        }
      } catch (err) {
        console.error("Failed to load profiles:", err);
      }
    }
    if (isOpen) {
      loadAMs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (clientToEdit) {
      setClientName(clientToEdit.client_name || clientToEdit.company_name || "");
      setIndustry(clientToEdit.industry || "");
      setWebsite(clientToEdit.website || "");
      setStatus(clientToEdit.status);
      setLeadSource(clientToEdit.lead_source || "referral");
      setTagsInput(clientToEdit.tags ? clientToEdit.tags.join(", ") : "");
      setAccountManagerId(clientToEdit.account_manager_id || "");

      // Populate primary contact if present
      const primary = clientToEdit.contacts && clientToEdit.contacts.length > 0
        ? clientToEdit.contacts[0]
        : null;

      setContactName(primary?.name || "");
      setContactRole(primary?.role || "");
      setContactEmail(primary?.email || clientToEdit.email || "");
      setContactPhone(primary?.phone || clientToEdit.phone || "");
      setContactAddress(primary?.address || clientToEdit.address || "");
      setPreferredChannel((primary?.preferred_channel as any) || "whatsapp");
    } else {
      setClientName("");
      setIndustry("");
      setWebsite("");
      setStatus("lead");
      setLeadSource("referral");
      setTagsInput("");
      setAccountManagerId(currentProfile?.id || "");

      // Reset contact details
      setContactName("");
      setContactRole("");
      setContactEmail("");
      setContactPhone("");
      setContactAddress("");
      setPreferredChannel("whatsapp");
    }
    setErrorMsg(null);
  }, [clientToEdit, isOpen, currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg("Client name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const safeAccountManagerId =
      accountManagerId && isValidUuid(accountManagerId) ? accountManagerId : null;

    const trimmedName = clientName.trim();
    const clientIdToSave = clientToEdit?.id && isValidUuid(clientToEdit.id) ? clientToEdit.id : generateUUID();

    const payload = {
      id: clientIdToSave,
      client_name: trimmedName,
      company_name: trimmedName,
      industry: industry.trim() || null,
      website: website.trim() || null,
      email: contactEmail.trim() || null,
      phone: contactPhone.trim() || null,
      address: contactAddress.trim() || null,
      status,
      lead_source: leadSource,
      tags: tagsArray,
      account_manager_id: safeAccountManagerId,
      updated_at: new Date().toISOString(),
    };

    try {
      let savedClientId: string = clientIdToSave;

      if (clientToEdit && isValidUuid(clientToEdit.id)) {
        const { data, error } = await supabase
          .from("clients")
          .update(payload)
          .eq("id", clientToEdit.id)
          .select()
          .single();
        if (error) throw error;
        savedClientId = (data as Client).id;
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
        savedClientId = (data as Client).id;
      }

      // Sync contact to Supabase contacts table if provided
      if (savedClientId && (contactEmail.trim() || contactPhone.trim() || contactAddress.trim() || contactName.trim())) {
        try {
          const contactPayload = {
            id: clientToEdit?.contacts?.[0]?.id && isValidUuid(clientToEdit.contacts[0].id)
              ? clientToEdit.contacts[0].id
              : generateUUID(),
            client_id: savedClientId,
            name: contactName.trim() || trimmedName,
            role: contactRole.trim() || "Primary Contact",
            email: contactEmail.trim() || null,
            phone: contactPhone.trim() || null,
            address: contactAddress.trim() || null,
            preferred_channel: preferredChannel,
          };
          if (clientToEdit?.contacts && clientToEdit.contacts.length > 0 && isValidUuid(clientToEdit.contacts[0].id)) {
            await supabase.from("contacts").update(contactPayload).eq("id", clientToEdit.contacts[0].id);
          } else {
            await supabase.from("contacts").insert(contactPayload);
          }
        } catch (cErr) {
          console.error("Could not sync contact to Supabase:", cErr);
        }
      }

      // Fetch the fresh client with contacts and account manager
      const { data: fullClient, error: fetchErr } = await supabase
        .from("clients")
        .select("*, account_manager:profiles(*), contacts(*)")
        .eq("id", savedClientId)
        .single();

      if (fullClient) {
        onSaved(fullClient as Client);
      } else {
        onSaved({
          ...payload,
          account_manager: accountManagers.find((am) => am.id === safeAccountManagerId) || null,
          contacts: [],
          created_at: new Date().toISOString(),
        } as unknown as Client);
      }

      onClose();
    } catch (err: any) {
      console.error("Supabase client operation error:", err?.message || err);
      setErrorMsg(err?.message || "Failed to save client to Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToEdit) return;
    const name = clientToEdit.client_name || clientToEdit.company_name || "this client";
    if (
      !confirm(
        `Are you sure you want to delete "${name}"?\n\nThis will permanently remove the client and all associated projects, invoices, and contacts.`
      )
    ) {
      return;
    }

    try {
      if (isValidUuid(clientToEdit.id)) {
        await supabase.from("clients").delete().eq("id", clientToEdit.id);
      }
      if (onDeleted) {
        onDeleted(clientToEdit.id);
      }
      onClose();
    } catch (err: any) {
      console.error("Could not delete client from Supabase:", err.message);
      alert("Failed to delete client: " + err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? "Edit Client Profile" : "Create New Client"}
      description="Record client contacts, organizational details, and assigned Account Manager."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Client Name *
          </label>
          <Input
            required
            placeholder="e.g. Acme Corporation or John Doe"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
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
            Tags (comma-separated)
          </label>
          <Input
            placeholder="Fintech, High-Priority, Mobile"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        {/* Primary Contact Details Section */}
        <div className="border border-border/80 rounded-lg p-3.5 bg-surface-elevated/20 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <User className="h-3.5 w-3.5 text-accent" />
            <span>Client Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="e.g. contact@client.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="pl-8"
                />
                <Mail className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="e.g. +91 98765 43210 or +1 555 0192"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Physical / Office Address <span className="text-muted font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. Suite 400, 100 Innovation Way"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="pl-8"
                />
                <MapPin className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Preferred Channel
              </label>
              <select
                value={preferredChannel}
                onChange={(e) =>
                  setPreferredChannel(
                    e.target.value as "whatsapp" | "email" | "phone" | "other"
                  )
                }
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="whatsapp">WhatsApp (Direct message / calls)</option>
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          {clientToEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs text-danger hover:bg-danger-bg hover:border-danger/40 border-border"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Client
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {clientToEdit ? "Save Changes" : "Create Client"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
