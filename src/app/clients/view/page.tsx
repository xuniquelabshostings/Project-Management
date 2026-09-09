"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Tag,
  Calendar,
  User,
  ArrowLeft,
  Edit2,
  Briefcase,
  Activity,
  Receipt,
  FolderOpen,
  Plus,
  Clock,
  Shield,
  PhoneCall,
  Server,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Loader2,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ContactsList } from "@/components/clients/ContactsList";
import { ActivityTimeline } from "@/components/clients/ActivityTimeline";
import { supabase } from "@/lib/supabase/client";
import { Client, Contact, ActivityLogEntry, Project } from "@/types/database.types";
import {
  getLocalClients,
  saveLocalClient,
  deleteLocalClient,
  getLocalProjects,
  getLocalActivities,
  isValidUuid,
} from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { sendClientWhatsAppRenewalAlert } from "@/lib/renewal-alert";

function getRenewalStatus(renewDateStr?: string | null, alertDays = 30) {
  if (!renewDateStr) return null;
  const target = new Date(renewDateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired" as const,
      label: `Expired ${Math.abs(diffDays)}d ago`,
      diffDays,
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/30",
    };
  }
  if (diffDays === 0) {
    return {
      status: "due_today" as const,
      label: "Expires Today",
      diffDays: 0,
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/30",
    };
  }
  if (diffDays <= alertDays) {
    return {
      status: "expiring_soon" as const,
      label: `${diffDays} days left`,
      diffDays,
      badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    };
  }
  return {
    status: "active" as const,
    label: `${diffDays} days left`,
    diffDays,
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  };
}

function ClientDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("id");

  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"contacts" | "activity" | "projects" | "invoices">("contacts");
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSendWhatsAppAlert = async () => {
    if (!client) return;
    setIsAlertSending(true);
    try {
      const res = await sendClientWhatsAppRenewalAlert(client, contacts, true);
      if (res.updatedClient) {
        setClient(res.updatedClient);
      }
    } catch (err: any) {
      console.error("Failed to send WhatsApp alert:", err);
    } finally {
      setIsAlertSending(false);
    }
  };

  const fetchClientFullData = async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);

      // 1. If not a valid UUID (e.g. legacy test ID), load directly from local store
      if (!isValidUuid(clientId)) {
        const localList = getLocalClients();
        const fallback = localList.find((c) => c.id === clientId) || null;
        if (fallback) {
          setClient(fallback);
          setContacts(fallback.contacts || []);
          setActivities(getLocalActivities(fallback.id));
          setProjects(getLocalProjects().filter((p) => p.client_id === fallback.id));
        } else {
          setClient(null);
        }
        setIsLoading(false);
        return;
      }

      // 2. Fetch client from live database
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .select("*, account_manager:profiles(*)")
        .eq("id", clientId)
        .single();

      if (clientErr || !clientData) {
        const localList = getLocalClients();
        const fallback = localList.find((c) => c.id === clientId) || null;
        if (fallback) {
          setClient(fallback);
          setContacts(fallback.contacts || []);
          setActivities(getLocalActivities(fallback.id));
          setProjects(getLocalProjects().filter((p) => p.client_id === fallback.id));
          return;
        } else {
          setClient(null);
          setIsLoading(false);
          return;
        }
      } else {
        setClient(clientData as Client);
      }

      // 3. Fetch contacts
      const localClient = getLocalClients().find((c) => c.id === clientId);
      const localContacts = localClient?.contacts || [];
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });
      if (contactsData && contactsData.length > 0) {
        const customContacts = localContacts.filter((lc) => !contactsData.some((cd) => cd.id === lc.id));
        setContacts([...customContacts, ...(contactsData as Contact[])]);
      } else if (localContacts.length > 0) {
        setContacts(localContacts);
      }

      // 4. Fetch activity log
      const localActs = getLocalActivities(clientId);
      const { data: activitiesData } = await supabase
        .from("activity_log")
        .select("*, author:profiles(*)")
        .eq("client_id", clientId)
        .order("occurred_at", { ascending: false });

      if (activitiesData && activitiesData.length > 0) {
        const customActs = localActs.filter((la) => !activitiesData.some((ad) => ad.id === la.id));
        const combined = [...customActs, ...(activitiesData as ActivityLogEntry[])].sort(
          (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
        );
        setActivities(combined);
      } else {
        setActivities(localActs);
      }

      // 5. Fetch linked projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      const localProjects = getLocalProjects().filter((p) => p.client_id === clientId);
      if (projectsData && projectsData.length > 0) {
        const customProjs = localProjects.filter((lp) => !projectsData.some((pd) => pd.id === lp.id));
        setProjects([...customProjs, ...(projectsData as Project[])]);
      } else {
        setProjects(localProjects);
      }
    } catch (err: any) {
      console.warn("Error fetching client details, checking fallback:", err.message);
      const localList = getLocalClients();
      const fallback = localList.find((c) => c.id === clientId) || null;
      if (fallback) {
        setClient(fallback);
        setContacts(fallback.contacts || []);
        setActivities(getLocalActivities(fallback.id));
        setProjects(getLocalProjects().filter((p) => p.client_id === fallback.id));
      } else {
        setClient(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientFullData();
  }, [clientId]);

  const handleDeleteClient = async () => {
    if (!client) return;
    const name = client.client_name || client.company_name || "this client";
    if (
      !confirm(
        `Are you sure you want to delete "${name}"?\n\nThis will permanently remove the client and all associated projects, invoices, and contacts.`
      )
    ) {
      return;
    }

    deleteLocalClient(client.id);

    if (isValidUuid(client.id)) {
      try {
        await supabase.from("clients").delete().eq("id", client.id);
      } catch (err: any) {
        console.warn("Could not delete client from Supabase:", err.message);
      }
    }

    router.push("/clients");
  };

  if (!clientId) {
    return (
      <div className="p-8 text-center text-sm text-muted">
        No client ID specified. Please return to the{" "}
        <Link href="/clients" className="text-accent underline">
          clients list
        </Link>
        .
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-muted">
        Loading client workspace...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-12 text-center">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Client Not Found or Access Denied
        </h2>
        <p className="text-xs text-muted mt-2">
          This record may not exist or you do not have permission to access it.
        </p>
        <Link href="/clients">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients Directory
        </Link>
      </div>

      {/* Client Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {client.client_name || client.company_name}
                </h1>
                <ClientStatusBadge status={client.status} />
                {client.lead_source && (
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    Source: {client.lead_source}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                {client.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {client.industry}
                  </span>
                )}
                {client.website && (
                  <a
                    href={
                      client.website.startsWith("http")
                        ? client.website
                        : `https://${client.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> {client.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-accent" /> {client.email}
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted hover:text-success transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-success" /> {client.phone}
                  </a>
                )}
                {client.address && (
                  <span className="flex items-center gap-1 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> {client.address}
                  </span>
                )}
              </div>

              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag className="w-3 h-3 text-muted mr-0.5" />
                  {client.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-surface-elevated text-muted px-2 py-0.5 rounded border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-danger hover:bg-danger-bg hover:border-danger/40 border-border"
                onClick={handleDeleteClient}
                title="Permanently delete this client"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Client
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure & Renewals Section */}
      {(() => {
        const domainStatus = getRenewalStatus(client.domain_renew_at, client.renewal_alert_days || 30);
        const hostingStatus = getRenewalStatus(client.hosting_renew_at, client.renewal_alert_days || 30);
        const hasAlert =
          (domainStatus && (domainStatus.status === "expiring_soon" || domainStatus.status === "expired" || domainStatus.status === "due_today")) ||
          (hostingStatus && (hostingStatus.status === "expiring_soon" || hostingStatus.status === "expired" || hostingStatus.status === "due_today"));
        const hasInfra = Boolean(client.domain_name || client.hosting_provider || client.domain_renew_at || client.hosting_renew_at);

        return (
          <Card className="border-border bg-surface shadow-xs">
            <CardHeader className="py-3 px-5 border-b border-border/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-semibold">Infrastructure & Service Renewals</CardTitle>
                {hasAlert && (
                  <span className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Renewal Alert
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasInfra && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAlertSending}
                    className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-500/30 dark:hover:bg-emerald-950/30 font-medium disabled:opacity-60"
                    onClick={handleSendWhatsAppAlert}
                    title="Automatically fetches client phone number, queries live WHOIS, and opens WhatsApp"
                  >
                    {isAlertSending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-emerald-500" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    )}
                    <span>{isAlertSending ? "Fetching WHOIS..." : "WhatsApp Renewal Alert"}</span>
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="w-3 h-3 mr-1" /> {hasInfra ? "Edit Infra" : "Setup Infra"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {!hasInfra ? (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-surface-elevated/40 border border-dashed border-border gap-3 text-center sm:text-left">
                  <div>
                    <p className="text-xs font-semibold text-foreground">No domain or hosting infrastructure tracked</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Store domain registrar, expiration dates, hosting plans, and send automatic WhatsApp renewal reminders.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Configure Domain & Hosting
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Domain Card */}
                  <div className="p-4 rounded-lg border border-border/80 bg-surface-elevated/40 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">Domain Registration</h4>
                            <p className="text-[10px] text-muted">
                              {client.domain_registrar || "Registrar unrecorded"}
                            </p>
                          </div>
                        </div>
                        {domainStatus && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${domainStatus.badgeClass}`}
                          >
                            {domainStatus.label}
                          </span>
                        )}
                      </div>

                      {client.domain_name ? (
                        <div className="my-2">
                          <a
                            href={`https://${client.domain_name.replace(/^https?:\/\//, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono font-medium text-accent hover:underline flex items-center gap-1.5"
                          >
                            {client.domain_name}
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic my-2">No domain name specified</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-muted block">Registered</span>
                          <span className="font-medium text-foreground">
                            {client.domain_registered_at || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">Renewal / Expiry</span>
                          <span className="font-medium text-foreground">
                            {client.domain_renew_at || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {client.domain_price != null && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-muted">Domain Cost:</span>
                        <span className="font-semibold text-foreground">{formatINR(client.domain_price)} / yr</span>
                      </div>
                    )}
                  </div>

                  {/* Hosting Card */}
                  <div className="p-4 rounded-lg border border-border/80 bg-surface-elevated/40 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">Web Hosting & Server</h4>
                            <p className="text-[10px] text-muted">
                              {client.hosting_provider || "Provider unrecorded"}
                            </p>
                          </div>
                        </div>
                        {hostingStatus && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${hostingStatus.badgeClass}`}
                          >
                            {hostingStatus.label}
                          </span>
                        )}
                      </div>

                      {client.hosting_plan ? (
                        <div className="my-2">
                          <span className="text-sm font-medium text-foreground">
                            {client.hosting_plan}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic my-2">No plan specified</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-muted block">Activated On</span>
                          <span className="font-medium text-foreground">
                            {client.hosting_activated_at || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block">Renewal Date</span>
                          <span className="font-medium text-foreground">
                            {client.hosting_renew_at || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {client.hosting_price != null && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-muted">Hosting Cost:</span>
                        <span className="font-semibold text-foreground">{formatINR(client.hosting_price)} / yr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Section Tabs */}
      <div className="border-b border-border/60 flex items-center gap-4 sm:gap-6 text-sm overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`pb-3 border-b-2 font-medium transition-colors ${
            activeTab === "contacts"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Stakeholders & Contacts ({contacts.length})
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 border-b-2 font-medium transition-colors ${
            activeTab === "activity"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Interaction Timeline ({activities.length})
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 border-b-2 font-medium transition-colors ${
            activeTab === "projects"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Projects ({projects.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "contacts" && (
        <ContactsList
          clientId={clientId}
          contacts={contacts}
          onContactsUpdated={fetchClientFullData}
        />
      )}

      {activeTab === "activity" && (
        <ActivityTimeline
          clientId={clientId}
          activities={activities}
          onActivitiesUpdated={fetchClientFullData}
        />
      )}

      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-foreground">
              Client Projects ({projects.length})
            </h3>
            <Link href={`/projects?newClient=${clientId}`}>
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-lg bg-surface-elevated/30">
              <Briefcase className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted">No projects created yet for {client.client_name || client.company_name}.</p>
              <Link href={`/projects?newClient=${clientId}`}>
                <Button variant="outline" size="sm" className="mt-3 text-xs">
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-lg border border-border bg-surface hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/projects/view?id=${proj.id}`}
                        className="font-medium text-sm text-foreground hover:text-accent transition-colors"
                      >
                        {proj.name}
                      </Link>
                      {proj.description && (
                        <p className="text-xs text-muted mt-1 line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {proj.status}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted">
                    <span>
                      Budget:{" "}
                      <strong className="text-foreground font-mono">
                        {proj.budget ? formatINR(proj.budget) : "Not set"}
                      </strong>
                    </span>
                    <Link
                      href={`/projects/view?id=${proj.id}`}
                      className="text-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      Kanban Board &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientToEdit={client}
        onSaved={(updated) => {
          setClient(updated);
          fetchClientFullData();
        }}
        onDeleted={() => router.push("/clients")}
      />
    </div>
  );
}

export default function ClientDetailPage() {
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
            <p className="text-sm text-muted mt-2">
              Only authorized Administrators and assigned Account Managers can view client profiles.
            </p>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="p-12 text-center text-sm text-muted">
              Loading client profile...
            </div>
          }
        >
          <ClientDetailContent />
        </Suspense>
      </RoleGate>
    </DashboardLayout>
  );
}
