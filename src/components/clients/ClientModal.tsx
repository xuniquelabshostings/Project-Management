"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, ClientStatus, LeadSource, Profile } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { saveLocalClient, generateUUID } from "@/lib/mock-data";
import { lookupDomainWhois } from "@/lib/domain-whois";
import {
  Globe,
  Server,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  clientToEdit?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSaved, clientToEdit }: ClientModalProps) {
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

  // Domain & Hosting Lifecycle State
  const [domainName, setDomainName] = useState("");
  const [domainRegistrar, setDomainRegistrar] = useState("");
  const [domainRegisteredAt, setDomainRegisteredAt] = useState("");
  const [domainRenewAt, setDomainRenewAt] = useState("");
  const [domainPrice, setDomainPrice] = useState("");
  const [hostingProvider, setHostingProvider] = useState("");
  const [hostingPlan, setHostingPlan] = useState("");
  const [hostingActivatedAt, setHostingActivatedAt] = useState("");
  const [hostingRenewAt, setHostingRenewAt] = useState("");
  const [hostingPrice, setHostingPrice] = useState("");
  const [renewalAlertDays, setRenewalAlertDays] = useState(30);

  const [showInfraSection, setShowInfraSection] = useState(false);
  const [isWhoisLoading, setIsWhoisLoading] = useState(false);
  const [whoisSuccessMsg, setWhoisSuccessMsg] = useState<string | null>(null);
  const [whoisErrorMsg, setWhoisErrorMsg] = useState<string | null>(null);

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

      // Populate domain & hosting
      setDomainName(clientToEdit.domain_name || "");
      setDomainRegistrar(clientToEdit.domain_registrar || "");
      setDomainRegisteredAt(clientToEdit.domain_registered_at || "");
      setDomainRenewAt(clientToEdit.domain_renew_at || "");
      setDomainPrice(clientToEdit.domain_price != null ? String(clientToEdit.domain_price) : "");
      setHostingProvider(clientToEdit.hosting_provider || "");
      setHostingPlan(clientToEdit.hosting_plan || "");
      setHostingActivatedAt(clientToEdit.hosting_activated_at || "");
      setHostingRenewAt(clientToEdit.hosting_renew_at || "");
      setHostingPrice(clientToEdit.hosting_price != null ? String(clientToEdit.hosting_price) : "");
      setRenewalAlertDays(clientToEdit.renewal_alert_days ?? 30);

      // Expand if client already has infra data
      if (
        clientToEdit.domain_name ||
        clientToEdit.hosting_provider ||
        clientToEdit.domain_renew_at ||
        clientToEdit.hosting_renew_at
      ) {
        setShowInfraSection(true);
      } else {
        setShowInfraSection(false);
      }
    } else {
      setClientName("");
      setIndustry("");
      setWebsite("");
      setStatus("lead");
      setLeadSource("referral");
      setTagsInput("");
      setAccountManagerId(currentProfile?.id || "");

      setDomainName("");
      setDomainRegistrar("");
      setDomainRegisteredAt("");
      setDomainRenewAt("");
      setDomainPrice("");
      setHostingProvider("");
      setHostingPlan("");
      setHostingActivatedAt("");
      setHostingRenewAt("");
      setHostingPrice("");
      setRenewalAlertDays(30);
      setShowInfraSection(false);
    }
    setErrorMsg(null);
    setWhoisErrorMsg(null);
    setWhoisSuccessMsg(null);
  }, [clientToEdit, isOpen, currentProfile]);

  const handleWhoisLookup = async () => {
    const target = (domainName || website || "").trim();
    if (!target) {
      setWhoisErrorMsg("Please enter a Domain Name or Website URL first.");
      return;
    }
    setIsWhoisLoading(true);
    setWhoisErrorMsg(null);
    setWhoisSuccessMsg(null);

    try {
      const data = await lookupDomainWhois(target);
      if (!data.success) {
        setWhoisErrorMsg(data.error || "Failed to lookup domain.");
        return;
      }

      if (data.domain) {
        setDomainName(data.domain);
      }
      if (data.registrar) {
        setDomainRegistrar(data.registrar);
      }
      if (data.registeredAt) {
        setDomainRegisteredAt(data.registeredAt);
      }
      if (data.expiresAt) {
        setDomainRenewAt(data.expiresAt);
      }
      setWhoisSuccessMsg(`Fetched details for ${data.domain}! Check registration & renewal.`);
      setShowInfraSection(true);
    } catch (err: any) {
      setWhoisErrorMsg(err.message || "Failed to contact domain lookup service.");
    } finally {
      setIsWhoisLoading(false);
    }
  };

  const buildInfraPayload = () => ({
    domain_name: domainName.trim() || null,
    domain_registrar: domainRegistrar.trim() || null,
    domain_registered_at: domainRegisteredAt || null,
    domain_renew_at: domainRenewAt || null,
    domain_price: domainPrice ? parseFloat(domainPrice) : null,
    hosting_provider: hostingProvider.trim() || null,
    hosting_plan: hostingPlan.trim() || null,
    hosting_activated_at: hostingActivatedAt || null,
    hosting_renew_at: hostingRenewAt || null,
    hosting_price: hostingPrice ? parseFloat(hostingPrice) : null,
    renewal_alert_days: Number(renewalAlertDays) || 30,
  });

  const saveLocally = (tagsArray: string[], safeAMId: string | null) => {
    const trimmedName = clientName.trim();
    const mockClient: Client = {
      id: clientToEdit?.id || generateUUID(),
      client_name: trimmedName,
      company_name: trimmedName,
      industry: industry.trim() || null,
      website: website.trim() || null,
      status,
      lead_source: leadSource,
      tags: tagsArray,
      account_manager_id: safeAMId || null,
      account_manager:
        accountManagers.find((am) => am.id === safeAMId) || currentProfile || null,
      contacts: clientToEdit?.contacts || [],
      ...buildInfraPayload(),
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

    if (isDemo) {
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
      status,
      lead_source: leadSource,
      tags: tagsArray,
      account_manager_id: safeAccountManagerId,
      ...buildInfraPayload(),
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
      description="Record client details, hosting, domain lifecycle, and assigned Account Manager."
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-foreground">
                Website URL
              </label>
              {website && !domainName && (
                <button
                  type="button"
                  onClick={handleWhoisLookup}
                  className="text-[10px] text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Auto-fill domain
                </button>
              )}
            </div>
            <Input
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (!domainName && e.target.value.includes(".")) {
                  const cleaned = e.target.value
                    .replace(/^https?:\/\//, "")
                    .replace(/^www\./, "")
                    .split("/")[0];
                  if (cleaned) setDomainName(cleaned);
                }
              }}
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

        {/* Collapsible Domain & Hosting Infrastructure Section */}
        <div className="border border-border/80 rounded-lg overflow-hidden bg-surface-elevated/30">
          <button
            type="button"
            onClick={() => setShowInfraSection(!showInfraSection)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface hover:bg-surface-elevated/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-foreground">
                Domain & Hosting Infrastructure
              </span>
              {(domainName || hostingProvider) && (
                <span className="text-[10px] bg-accent/15 text-accent font-medium px-2 py-0.5 rounded-full">
                  Configured
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{showInfraSection ? "Hide Details" : "Add / View Details"}</span>
              {showInfraSection ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </button>

          {showInfraSection && (
            <div className="p-3.5 space-y-4 border-t border-border/60 bg-surface">
              {/* WHOIS status messages */}
              {whoisSuccessMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-success-bg border border-success/30 text-success text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{whoisSuccessMsg}</span>
                </div>
              )}
              {whoisErrorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-danger-bg border border-danger/30 text-danger text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{whoisErrorMsg}</span>
                </div>
              )}

              {/* Domain Subsection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Globe className="h-3.5 w-3.5 text-accent" />
                    <span>Domain Details</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleWhoisLookup}
                    disabled={isWhoisLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent/90 bg-accent/10 hover:bg-accent/20 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {isWhoisLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span>{isWhoisLoading ? "Querying RDAP..." : "Auto-Fetch via WHOIS"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Domain Name
                    </label>
                    <Input
                      placeholder="e.g. example.com"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Registrar
                    </label>
                    <Input
                      placeholder="e.g. GoDaddy, Namecheap"
                      value={domainRegistrar}
                      onChange={(e) => setDomainRegistrar(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Registered Date
                    </label>
                    <Input
                      type="date"
                      value={domainRegisteredAt}
                      onChange={(e) => setDomainRegisteredAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Renewal / Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={domainRenewAt}
                      onChange={(e) => setDomainRenewAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Domain Cost ($/yr)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                      value={domainPrice}
                      onChange={(e) => setDomainPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Hosting Subsection */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Server className="h-3.5 w-3.5 text-accent" />
                  <span>Web Hosting & Server Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Hosting Provider
                    </label>
                    <Input
                      placeholder="e.g. AWS, Vercel, Hostinger, GCP"
                      value={hostingProvider}
                      onChange={(e) => setHostingProvider(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Hosting Plan / Tier
                    </label>
                    <Input
                      placeholder="e.g. Business Pro, VPS 4GB, Cloud Run"
                      value={hostingPlan}
                      onChange={(e) => setHostingPlan(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Activation Date
                    </label>
                    <Input
                      type="date"
                      value={hostingActivatedAt}
                      onChange={(e) => setHostingActivatedAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Renewal Date
                    </label>
                    <Input
                      type="date"
                      value={hostingRenewAt}
                      onChange={(e) => setHostingRenewAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Hosting Cost ($/yr)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="75.00"
                      value={hostingPrice}
                      onChange={(e) => setHostingPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Send renewal alerts prior to:
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    className="w-20 text-center text-xs py-1"
                    value={renewalAlertDays}
                    onChange={(e) => setRenewalAlertDays(Number(e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
            </div>
          )}
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
