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
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ClientModal } from "@/components/clients/ClientModal";
import { ContactsList } from "@/components/clients/ContactsList";
import { ActivityTimeline } from "@/components/clients/ActivityTimeline";
import { supabase } from "@/lib/supabase/client";
import { Client, Contact, ActivityLogEntry, Project } from "@/types/database.types";
import { formatINR } from "@/lib/utils";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchClientFullData = async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);

      // Fetch client from live database
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .select("*, account_manager:profiles(*)")
        .eq("id", clientId)
        .maybeSingle();

      if (clientErr || !clientData) {
        setClient(null);
        return;
      }
      setClient(clientData as Client);

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });
      setContacts((contactsData as Contact[]) || []);

      // Fetch activity log
      const { data: activitiesData } = await supabase
        .from("activity_log")
        .select("*, author:profiles(*)")
        .eq("client_id", clientId)
        .order("occurred_at", { ascending: false });
      setActivities((activitiesData as ActivityLogEntry[]) || []);

      // Fetch linked projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      setProjects((projectsData as Project[]) || []);
    } catch (err: any) {
      console.warn("Error fetching client details:", err.message);
      setClient(null);
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

    try {
      await supabase.from("clients").delete().eq("id", client.id);
    } catch (err: any) {
      console.warn("Could not delete client from Supabase:", err.message);
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
