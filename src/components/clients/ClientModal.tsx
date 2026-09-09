"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, ClientStatus, LeadSource, Profile, Contact } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { saveLocalClient, generateUUID, deleteLocalClient, isValidUuid } from "@/lib/mock-data";
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
      setClientName(clientToEdit.client_name || clientToEdit.company_name || "");
      setIndustry(clientToEdit.industry || "");
      setWebsite(clientToEdit.website || "");
      setStatus(clientToEdit.status);
      setLeadSource(clientToEdit.lead_source || "referral");
      setTagsInput(clientToEdit.tags ? clientToEdit.tags.join(", ") : "");
      setAccountManagerId(clientToEdit.account_manager_id || "");

      // Populate contact details from primary contact or client fields
      const primaryContact = clientToEdit.contacts && clientToEdit.contacts.length > 0 ? clientToEdit.contacts[0] : null;
      setContactName(primaryContact?.name || "");
      setContactRole(primaryContact?.role || "");
      setContactEmail(primaryContact?.email || clientToEdit.email || "");
      setContactPhone(primaryContact?.phone || clientToEdit.phone || "");
      setContactAddress(primaryContact?.address || clientToEdit.address || "");
      setPreferredChannel((primaryContact?.preferred_channel as any) || "whatsapp");
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

  const saveLocally = (tagsArray: string[], safeAMId: string | null) => {
    const trimmedName = clientName.trim();
    const existingContacts = clientToEdit?.contacts || [];
    let updatedContacts = [...existingContacts];

    // If contact info was provided, update existing primary contact or add a new one
    if (contactName.trim() || contactEmail.trim() || contactPhone.trim() || contactAddress.trim()) {
      const contactPayload: Contact = {
        id: updatedContacts.length > 0 ? updatedContacts[0].id : generateUUID(),
        client_id: clientToEdit?.id || generateUUID(),
        name: contactName.trim() || trimmedName,
        role: contactRole.trim() || (updatedContacts[0]?.role || "Primary Contact"),
        email: contactEmail.trim() || null,
        phone: contactPhone.trim() || null,
        address: contactAddress.trim() || null,
        preferred_channel: preferredChannel,
        created_at: updatedContacts[0]?.created_at || new Date().toISOString(),
      };

      if (updatedContacts.length > 0) {
        updatedContacts[0] = contactPayload;
      } else {
        updatedContacts = [contactPayload];
      }
    }

    const mockClient: Client = {
      id: clientToEdit?.id || generateUUID(),
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
      account_manager_id: safeAMId || null,
      account_manager:
        accountManagers.find((am) => am.id === safeAMId) || currentProfile || null,
      contacts: updatedContacts,
      domain_name: clientToEdit?.domain_name || null,
      domain_registrar: clientToEdit?.domain_registrar || null,
      domain_registered_at: clientToEdit?.domain_registered_at || null,
      domain_renew_at: clientToEdit?.domain_renew_at || null,
      domain_price: clientToEdit?.domain_price ?? null,
      hosting_provider: clientToEdit?.hosting_provider || null,
      hosting_plan: clientToEdit?.hosting_plan || null,
      hosting_activated_at: clientToEdit?.hosting_activated_at || null,
      hosting_renew_at: clientToEdit?.hosting_renew_at || null,
      hosting_price: clientToEdit?.hosting_price ?? null,
      renewal_alert_days: clientToEdit?.renewal_alert_days ?? 30,
      created_at: clientToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalClient(mockClient);
    onSaved(mockClient);
    onClose();
  };

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

    const isDemo = !session || (currentProfile?.id && currentProfile.id.startsWith("00000000"));

    // Sanitize accountManagerId: avoid sending mock ID to live database
    const safeAccountManagerId =
      accountManagerId && !accountManagerId.startsWith("00000000")
        ? accountManagerId
        : session?.user?.id || null;

    if (isDemo || (clientToEdit && !isValidUuid(clientToEdit.id))) {
      saveLocally(tagsArray, safeAccountManagerId);
      setIsLoading(false);
      return;
    }

    const trimmedName = clientName.trim();
    const payload = {
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
      let savedClientId: string = clientToEdit?.id || "";

      const performDbSave = async (dataPayload: any) => {
        if (clientToEdit && isValidUuid(clientToEdit.id)) {
          const { data, error } = await supabase
            .from("clients")
            .update(dataPayload)
            .eq("id", clientToEdit.id)
            .select()
            .single();
          if (error) throw error;
          return (data as Client).id;
        } else if (!clientToEdit) {
          const { data, error } = await supabase
            .from("clients")
            .insert({
              ...dataPayload,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();
          if (error) throw error;
          return (data as Client).id;
        } else {
          return clientToEdit.id;
        }
      };

      try {
        savedClientId = await performDbSave(payload);
      } catch (firstErr: any) {
        // If Postgres/PostgREST complains about missing columns (e.g. 'address', 'phone', 'email') in the remote schema cache,
        // retry with core standard columns so the client still saves to Supabase
        if (firstErr?.message?.toLowerCase().includes("column") || firstErr?.code === "PGRST204" || firstErr?.code === "42703") {
          const fallbackCorePayload = {
            company_name: trimmedName,
            client_name: trimmedName,
            industry: industry.trim() || null,
            website: website.trim() || null,
            status,
            lead_source: leadSource,
            tags: tagsArray,
            account_manager_id: safeAccountManagerId,
            updated_at: new Date().toISOString(),
          };
          try {
            savedClientId = await performDbSave(fallbackCorePayload);
          } catch (retryErr) {
            console.warn("Core payload save error, saving locally:", retryErr);
          }
        } else {
          throw firstErr;
        }
      }

      // Sync contact to Supabase contacts table if provided and ID is valid UUID
      if (savedClientId && isValidUuid(savedClientId) && (contactEmail.trim() || contactPhone.trim() || contactAddress.trim())) {
        try {
          const contactPayload = {
            client_id: savedClientId,
            name: trimmedName,
            role: "Primary Contact",
            email: contactEmail.trim() || null,
            phone: contactPhone.trim() || null,
            preferred_channel: preferredChannel,
          };
          if (clientToEdit?.contacts && clientToEdit.contacts.length > 0 && isValidUuid(clientToEdit.contacts[0].id)) {
            await supabase.from("contacts").update(contactPayload).eq("id", clientToEdit.contacts[0].id);
          } else {
            await supabase.from("contacts").insert(contactPayload);
          }
        } catch (cErr) {
          console.warn("Could not sync contact to Supabase contacts table:", cErr);
        }
      }

      saveLocally(tagsArray, safeAccountManagerId);
    } catch (err: any) {
      console.warn("Supabase client operation failed, persisting locally:", err?.message || err);
      // Fallback locally and persist so the client is updated smoothly without interruption
      saveLocally(tagsArray, safeAccountManagerId);
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

    deleteLocalClient(clientToEdit.id);

    if (isValidUuid(clientToEdit.id)) {
      try {
        await supabase.from("clients").delete().eq("id", clientToEdit.id);
      } catch (err: any) {
        console.warn("Could not delete client from Supabase:", err.message);
      }
    }

    if (onDeleted) {
      onDeleted(clientToEdit.id);
    }
    onClose();
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
