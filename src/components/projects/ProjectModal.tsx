"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Project, ProjectStatus, Client } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { isValidUuid, generateUUID } from "@/lib/mock-data";
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

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (project: Project) => void;
  projectToEdit?: Project | null;
  defaultClientId?: string;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  defaultClientId,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Domain & Hosting Infrastructure State
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
  const lastFetchedDomainRef = useRef<string>("");

  useEffect(() => {
    async function loadClients() {
      try {
        const { data } = await supabase
          .from("clients")
          .select("*")
          .order("company_name", { ascending: true });

        setClients((data as Client[]) || []);
      } catch (err) {
        console.error("Failed to load clients:", err);
      }
    }
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  // Handle prefilling when editing or when defaultClientId is provided
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setClientId(projectToEdit.client_id);
      setDescription(projectToEdit.description || "");
      setTechStackInput(projectToEdit.tech_stack ? projectToEdit.tech_stack.join(", ") : "");
      setBudget(projectToEdit.budget ? String(projectToEdit.budget) : "");
      setStartDate(projectToEdit.start_date || "");
      setEndDate(projectToEdit.end_date || "");
      setStatus(projectToEdit.status);

      // Populate domain & hosting from project or linked client
      const c =
        projectToEdit.client ||
        clients.find((cl) => cl.id === projectToEdit.client_id);

      const dName = projectToEdit.domain_name || c?.domain_name || "";
      setDomainName(dName);
      setDomainRegistrar(projectToEdit.domain_registrar || c?.domain_registrar || "");
      setDomainRegisteredAt(projectToEdit.domain_registered_at || c?.domain_registered_at || "");
      setDomainRenewAt(projectToEdit.domain_renew_at || c?.domain_renew_at || "");
      setDomainPrice(
        projectToEdit.domain_price != null
          ? String(projectToEdit.domain_price)
          : c?.domain_price != null
          ? String(c.domain_price)
          : ""
      );
      setHostingProvider(projectToEdit.hosting_provider || c?.hosting_provider || "");
      setHostingPlan(projectToEdit.hosting_plan || c?.hosting_plan || "");
      setHostingActivatedAt(projectToEdit.hosting_activated_at || c?.hosting_activated_at || "");
      setHostingRenewAt(projectToEdit.hosting_renew_at || c?.hosting_renew_at || "");
      setHostingPrice(
        projectToEdit.hosting_price != null
          ? String(projectToEdit.hosting_price)
          : c?.hosting_price != null
          ? String(c.hosting_price)
          : ""
      );
      setRenewalAlertDays(projectToEdit.renewal_alert_days ?? c?.renewal_alert_days ?? 30);
      lastFetchedDomainRef.current = dName.toLowerCase().trim();

      if (dName || projectToEdit.hosting_provider || c?.domain_name || c?.hosting_provider) {
        setShowInfraSection(true);
      } else {
        setShowInfraSection(false);
      }
    } else {
      setName("");
      const initialClientId = defaultClientId || "";
      setClientId(initialClientId);
      setDescription("");
      setTechStackInput("");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setStatus("active");

      // If default client provided, pull their domain & infra details
      if (initialClientId) {
        const c = clients.find((cl) => cl.id === initialClientId);
        if (c) {
          populateDomainFromClient(c);
        } else {
          resetDomainFields();
        }
      } else {
        resetDomainFields();
      }
    }
    setErrorMsg(null);
    setWhoisErrorMsg(null);
    setWhoisSuccessMsg(null);
  }, [projectToEdit, isOpen, defaultClientId]);

  const resetDomainFields = () => {
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
    lastFetchedDomainRef.current = "";
  };

  const populateDomainFromClient = (c: Client) => {
    if (c.domain_name) {
      setDomainName(c.domain_name);
      lastFetchedDomainRef.current = c.domain_name.toLowerCase().trim();
      setShowInfraSection(true);
    }
    if (c.domain_registrar) setDomainRegistrar(c.domain_registrar);
    if (c.domain_registered_at) setDomainRegisteredAt(c.domain_registered_at);
    if (c.domain_renew_at) setDomainRenewAt(c.domain_renew_at);
    if (c.domain_price != null) setDomainPrice(String(c.domain_price));
    if (c.hosting_provider) {
      setHostingProvider(c.hosting_provider);
      setShowInfraSection(true);
    }
    if (c.hosting_plan) setHostingPlan(c.hosting_plan);
    if (c.hosting_activated_at) setHostingActivatedAt(c.hosting_activated_at);
    if (c.hosting_renew_at) setHostingRenewAt(c.hosting_renew_at);
    if (c.hosting_price != null) setHostingPrice(String(c.hosting_price));
    if (c.renewal_alert_days != null) setRenewalAlertDays(c.renewal_alert_days);
  };

  // When client selection changes in the form, automatically pull their domain details!
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    if (!newClientId) return;

    const selectedClient = clients.find((c) => c.id === newClientId);
    if (selectedClient) {
      populateDomainFromClient(selectedClient);
    }
  };

  // Auto-fetch WHOIS domain details as user enters/types a domain
  useEffect(() => {
    const raw = domainName.trim();
    if (!raw) return;

    const clean = raw
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split(":")[0];

    // Must look like a real domain (has a dot, 4+ chars, valid TLD)
    if (!clean.includes(".") || clean.length < 4 || clean.endsWith(".")) {
      return;
    }

    const tld = clean.split(".").pop();
    if (!tld || tld.length < 2) return;

    if (lastFetchedDomainRef.current === clean) return;

    const debounceTimer = setTimeout(async () => {
      lastFetchedDomainRef.current = clean;
      setIsWhoisLoading(true);
      setWhoisErrorMsg(null);
      setWhoisSuccessMsg(null);

      try {
        const data = await lookupDomainWhois(clean);
        if (data.success) {
          if (data.domain) setDomainName(data.domain);
          if (data.registrar) setDomainRegistrar(data.registrar);
          if (data.registeredAt) setDomainRegisteredAt(data.registeredAt);
          if (data.expiresAt) setDomainRenewAt(data.expiresAt);
          setWhoisSuccessMsg(`Auto-detected registrar & renewal for ${data.domain}!`);
          setShowInfraSection(true);
        }
      } catch (err: any) {
        // silent fail on auto-fetch
      } finally {
        setIsWhoisLoading(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [domainName]);

  const handleManualWhoisLookup = async () => {
    const target = domainName.trim();
    if (!target) {
      setWhoisErrorMsg("Please enter a domain name first.");
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

      if (data.domain) setDomainName(data.domain);
      if (data.registrar) setDomainRegistrar(data.registrar);
      if (data.registeredAt) setDomainRegisteredAt(data.registeredAt);
      if (data.expiresAt) setDomainRenewAt(data.expiresAt);
      setWhoisSuccessMsg(`Fetched details for ${data.domain}!`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }
    if (!clientId) {
      setErrorMsg("Please select a client for this project.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const techArray = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const infraPayload = buildInfraPayload();
    const payload = {
      name: name.trim(),
      client_id: clientId,
      description: description.trim() || null,
      tech_stack: techArray,
      budget: budget ? parseFloat(budget) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
      ...infraPayload,
      updated_at: new Date().toISOString(),
    };

    try {
      if (projectToEdit && isValidUuid(projectToEdit.id)) {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", projectToEdit.id)
          .select("*, client:clients(*)")
          .single();

        if (error) throw error;
        onSaved(data as Project);
        onClose();
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            ...payload,
            kanban_columns: ["To Do", "In Progress", "Review", "Done"],
            created_at: new Date().toISOString(),
          })
          .select("*, client:clients(*)")
          .single();

        if (error) throw error;
        onSaved(data as Project);
        onClose();
      }
    } catch (err: any) {
      console.error("Supabase project save error:", err?.message || err);
      setErrorMsg(err?.message || "Failed to save project to Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Edit Project" : "Create New Project"}
      description="Define the scope, deliverables, budget, timeline, and domain infrastructure."
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
            onChange={(e) => handleClientChange(e.target.value)}
            disabled={!!projectToEdit}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-60"
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
            Project Name *
          </label>
          <Input
            required
            placeholder="e.g. Customer Portal Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Scope & Description
          </label>
          <Textarea
            rows={3}
            placeholder="Brief scope, deliverables, or objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Estimated Budget (INR - ₹)
            </label>
            <Input
              type="number"
              min="0"
              step="1000"
              placeholder="250000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Tech Stack (comma-separated)
          </label>
          <Input
            placeholder="Next.js, Tailwind, PostgreSQL, Docker"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target Completion Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
                  Linked ({domainName || hostingProvider})
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
                    <span>Domain Details (Auto-fetches on typing)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualWhoisLookup}
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
                      Domain Cost (₹ INR/yr)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      placeholder="1000"
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
                      placeholder="e.g. Business Pro, VPS 4GB"
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
                      Hosting Cost (₹ INR/yr)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      placeholder="5000"
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
            {projectToEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
