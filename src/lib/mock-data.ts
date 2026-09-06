import { Client, Contact, Project, Task, Milestone, Invoice, ActivityLogEntry, Profile, Agreement, BlogPost } from "@/types/database.types";

export const MOCK_PROFILES: Profile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@xuniquelabs.com",
    full_name: "Marcus Vance",
    role: "admin",
    avatar_url: null,
    phone: "+1 (555) 019-2831",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "alex.am@xuniquelabs.com",
    full_name: "Alex Morgan",
    role: "account_manager",
    avatar_url: null,
    phone: "+1 (555) 019-4829",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "sarah.dev@xuniquelabs.com",
    full_name: "Sarah Chen",
    role: "developer",
    avatar_url: null,
    phone: "+1 (555) 019-9921",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    client_name: "Acme FinTech Corp",
    company_name: "Acme FinTech Corp",
    industry: "Financial Services",
    website: "https://acmefin.example.com",
    status: "active",
    lead_source: "referral",
    tags: ["Fintech", "React", "Cloud"],
    account_manager_id: "00000000-0000-0000-0000-000000000001",
    account_manager: MOCK_PROFILES[0],
    domain_name: "acmefin.example.com",
    domain_registrar: "Namecheap, Inc.",
    domain_registered_at: "2024-05-12",
    domain_renew_at: "2027-05-12",
    domain_price: 1200,
    hosting_provider: "AWS Cloud",
    hosting_plan: "t4g.xlarge Production Cluster",
    hosting_activated_at: "2024-06-01",
    hosting_renew_at: "2027-06-01",
    hosting_price: 9500,
    renewal_alert_days: 30,
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-08-15T10:00:00Z",
    contacts: [
      {
        id: "d0000000-0000-0000-0000-000000000001",
        client_id: "c0000000-0000-0000-0000-000000000001",
        name: "Sarah Jenkins",
        role: "VP of Engineering",
        email: "sarah@acmefin.example.com",
        phone: "+1 (555) 234-5678",
        preferred_channel: "whatsapp",
        created_at: "2026-08-15T10:00:00Z",
      },
      {
        id: "d0000000-0000-0000-0000-000000000002",
        client_id: "c0000000-0000-0000-0000-000000000001",
        name: "David Ross",
        role: "Product Director",
        email: "david@acmefin.example.com",
        phone: "+1 (555) 234-5679",
        preferred_channel: "email",
        created_at: "2026-08-15T10:00:00Z",
      },
    ],
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    client_name: "Lumina Health Labs",
    company_name: "Lumina Health Labs",
    industry: "Healthcare & Biotech",
    website: "https://luminahealth.example.com",
    status: "negotiation",
    lead_source: "inbound",
    tags: ["Healthcare", "HIPAA", "Mobile"],
    account_manager_id: "00000000-0000-0000-0000-000000000002",
    account_manager: MOCK_PROFILES[1],
    domain_name: "luminahealth.example.com",
    domain_registrar: "GoDaddy.com, LLC",
    domain_registered_at: "2023-09-20",
    domain_renew_at: "2026-09-20",
    domain_price: 1500,
    hosting_provider: "Vercel Enterprise",
    hosting_plan: "Pro Team + Secure Edge",
    hosting_activated_at: "2023-09-20",
    hosting_renew_at: "2026-09-25",
    hosting_price: 6500,
    renewal_alert_days: 30,
    created_at: "2026-08-20T14:30:00Z",
    updated_at: "2026-08-20T14:30:00Z",
    contacts: [
      {
        id: "d0000000-0000-0000-0000-000000000003",
        client_id: "c0000000-0000-0000-0000-000000000002",
        name: "Dr. Elena Vance",
        role: "Chief Science Officer",
        email: "elena@luminahealth.example.com",
        phone: "+1 (555) 876-5432",
        preferred_channel: "phone",
        created_at: "2026-08-20T14:30:00Z",
      },
    ],
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    client_name: "Apex Logistics",
    company_name: "Apex Logistics",
    industry: "Supply Chain",
    website: "https://apexlogistics.example.com",
    status: "lead",
    lead_source: "linkedin",
    tags: ["Enterprise", "Logistics"],
    account_manager_id: null,
    account_manager: null,
    created_at: "2026-09-01T09:15:00Z",
    updated_at: "2026-09-01T09:15:00Z",
    contacts: [],
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    client_id: "c0000000-0000-0000-0000-000000000001",
    name: "Merchant Portal Redesign",
    description: "Revamp of the merchant settlement portal with real-time analytics",
    tech_stack: ["Next.js", "PostgreSQL", "Tailwind"],
    start_date: "2026-09-01",
    end_date: "2026-11-30",
    budget: 35000,
    status: "active",
    kanban_columns: ["To Do", "In Progress", "Review", "Done"],
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
    client: MOCK_CLIENTS[0],
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    client_id: "c0000000-0000-0000-0000-000000000002",
    name: "Clinical Data Dashboard",
    description: "HIPAA compliant patient telemetry analytics pipeline",
    tech_stack: ["Python", "React", "FastAPI"],
    start_date: "2026-10-01",
    end_date: "2027-01-15",
    budget: 52000,
    status: "planning",
    kanban_columns: ["To Do", "In Progress", "Review", "Done"],
    created_at: "2026-09-02T11:00:00Z",
    updated_at: "2026-09-02T11:00:00Z",
    client: MOCK_CLIENTS[1],
  },
];

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    project_id: "e0000000-0000-0000-0000-000000000001",
    title: "Sprint 1: Architecture & SSO Setup",
    description: "Base infrastructure, database schema, and authentication",
    due_date: "2026-09-15",
    completed: true,
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    project_id: "e0000000-0000-0000-0000-000000000001",
    title: "Sprint 2: Settlement Tables UI",
    description: "High-throughput data tables with filter and export",
    due_date: "2026-10-01",
    completed: false,
    created_at: "2026-09-01T10:00:00Z",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    project_id: "e0000000-0000-0000-0000-000000000001",
    title: "Implement Merchant Settlement Table with Virtual Scroll",
    description: "Ensure performance with 50,000+ records using tanstack table virtualizer",
    priority: "urgent",
    kanban_column: "In Progress",
    column_order: 0,
    due_date: "2026-09-10",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-09-02T12:00:00Z",
    updated_at: "2026-09-02T12:00:00Z",
    project: MOCK_PROJECTS[0],
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    project_id: "e0000000-0000-0000-0000-000000000001",
    title: "Set up Webhook endpoint for Stripe chargebacks",
    description: "Handle disputes and sync status into audit database",
    priority: "high",
    kanban_column: "To Do",
    column_order: 1,
    due_date: "2026-09-18",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-09-03T09:00:00Z",
    updated_at: "2026-09-03T09:00:00Z",
    project: MOCK_PROJECTS[0],
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    project_id: "e0000000-0000-0000-0000-000000000001",
    title: "QA audit on Mobile Responsive Navigation",
    description: "Verify touch target sizes and slide-over menu performance",
    priority: "medium",
    kanban_column: "Review",
    column_order: 2,
    due_date: "2026-09-12",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-09-03T11:00:00Z",
    updated_at: "2026-09-03T11:00:00Z",
    project: MOCK_PROJECTS[0],
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "i0000000-0000-0000-0000-000000000001",
    client_id: "c0000000-0000-0000-0000-000000000001",
    project_id: "e0000000-0000-0000-0000-000000000001",
    milestone_id: "f0000000-0000-0000-0000-000000000001",
    invoice_number: "INV-2026-001",
    status: "paid",
    total_amount: 15000,
    due_date: "2026-09-01",
    is_recurring: false,
    recurrence_interval: null,
    notes: "Sprint 1 kickoff invoice settled via Wire transfer",
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-09-01T15:00:00Z",
    client: MOCK_CLIENTS[0],
    project: MOCK_PROJECTS[0],
    line_items: [
      {
        id: "li-001",
        invoice_id: "i0000000-0000-0000-0000-000000000001",
        description: "Phase 1: Architecture Blueprint & Tech Stack Setup",
        quantity: 1,
        unit_price: 10000,
        line_total: 10000,
      },
      {
        id: "li-002",
        invoice_id: "i0000000-0000-0000-0000-000000000001",
        description: "User Authentication & RBAC System Integration",
        quantity: 1,
        unit_price: 5000,
        line_total: 5000,
      },
    ],
  },
  {
    id: "i0000000-0000-0000-0000-000000000002",
    client_id: "c0000000-0000-0000-0000-000000000001",
    project_id: "e0000000-0000-0000-0000-000000000001",
    milestone_id: "f0000000-0000-0000-0000-000000000002",
    invoice_number: "INV-2026-002",
    status: "overdue",
    total_amount: 12000,
    due_date: "2026-09-02",
    is_recurring: false,
    recurrence_interval: null,
    notes: "Sprint 2 milestone deliverable",
    created_at: "2026-08-28T10:00:00Z",
    updated_at: "2026-09-02T10:00:00Z",
    client: MOCK_CLIENTS[0],
    project: MOCK_PROJECTS[0],
    line_items: [
      {
        id: "li-003",
        invoice_id: "i0000000-0000-0000-0000-000000000002",
        description: "Sprint 2: Kanban Drag-and-Drop Task Management Flow",
        quantity: 1,
        unit_price: 8000,
        line_total: 8000,
      },
      {
        id: "li-004",
        invoice_id: "i0000000-0000-0000-0000-000000000002",
        description: "Client Interaction Timeline & Audit Log Module",
        quantity: 1,
        unit_price: 4000,
        line_total: 4000,
      },
    ],
  },
];

export const MOCK_ACTIVITIES: ActivityLogEntry[] = [
  {
    id: "ac000000-0000-0000-0000-000000000001",
    client_id: "c0000000-0000-0000-0000-000000000001",
    logged_by: "00000000-0000-0000-0000-000000000001",
    type: "call",
    summary: "Reviewed Sprint 1 deliverables with Sarah Jenkins. Approved architecture diagram.",
    occurred_at: "2026-09-04T15:30:00Z",
    created_at: "2026-09-04T15:30:00Z",
    author: MOCK_PROFILES[0],
  },
  {
    id: "ac000000-0000-0000-0000-000000000002",
    client_id: "c0000000-0000-0000-0000-000000000002",
    logged_by: "00000000-0000-0000-0000-000000000002",
    type: "whatsapp",
    summary: "WhatsApp message exchange with Dr. Vance regarding HIPAA data retention policies.",
    occurred_at: "2026-09-03T11:20:00Z",
    created_at: "2026-09-03T11:20:00Z",
    author: MOCK_PROFILES[1],
  },
];

const LOCAL_CLIENTS_KEY = "xunique_custom_clients";

export function getLocalClients(): Client[] {
  if (typeof window === "undefined") return MOCK_CLIENTS;
  try {
    const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
    if (!raw) return MOCK_CLIENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const customIds = new Set(parsed.map((c: Client) => c.id));
      const remainingDefaults = MOCK_CLIENTS.filter((c) => !customIds.has(c.id));
      return [...parsed, ...remainingDefaults];
    }
    return MOCK_CLIENTS;
  } catch {
    return MOCK_CLIENTS;
  }
}

export function saveLocalClient(client: Client): Client[] {
  const normalized: Client = {
    ...client,
    client_name: client.client_name || client.company_name,
    company_name: client.company_name || client.client_name || "",
  };
  if (typeof window === "undefined") return [normalized, ...MOCK_CLIENTS];
  try {
    const current = getLocalClients();
    const existingIndex = current.findIndex((c) => c.id === normalized.id);
    let updated: Client[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = normalized;
    } else {
      updated = [normalized, ...current];
    }
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [normalized, ...MOCK_CLIENTS];
  }
}

export function deleteLocalClient(clientId: string): Client[] {
  if (typeof window === "undefined") return MOCK_CLIENTS.filter((c) => c.id !== clientId);
  try {
    const current = getLocalClients();
    const updated = current.filter((c) => c.id !== clientId);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return MOCK_CLIENTS.filter((c) => c.id !== clientId);
  }
}

export function isValidUuid(str: string | null | undefined): boolean {
  if (!str) return false;
  // Match standard 8-4-4-4-12 hex UUID format (case insensitive)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function saveLocalContact(clientId: string, contact: Contact): void {
  if (typeof window === "undefined") return;
  try {
    const clients = getLocalClients();
    const targetClient = clients.find((c) => c.id === clientId);
    if (targetClient) {
      const currentContacts = targetClient.contacts || [];
      const existingIndex = currentContacts.findIndex((c) => c.id === contact.id);
      let updatedContacts: Contact[];
      if (existingIndex >= 0) {
        updatedContacts = [...currentContacts];
        updatedContacts[existingIndex] = contact;
      } else {
        updatedContacts = [contact, ...currentContacts];
      }
      targetClient.contacts = updatedContacts;
      saveLocalClient(targetClient);
    }
  } catch (err) {
    console.warn("Failed to save local contact:", err);
  }
}

export function deleteLocalContact(clientId: string, contactId: string): void {
  if (typeof window === "undefined") return;
  try {
    const clients = getLocalClients();
    const targetClient = clients.find((c) => c.id === clientId);
    if (targetClient && targetClient.contacts) {
      targetClient.contacts = targetClient.contacts.filter((c) => c.id !== contactId);
      saveLocalClient(targetClient);
    }
  } catch (err) {
    console.warn("Failed to delete local contact:", err);
  }
}

const LOCAL_ACTIVITIES_KEY = "xunique_custom_activities";

export function getLocalActivities(clientId?: string): ActivityLogEntry[] {
  if (typeof window === "undefined") {
    const list = clientId ? MOCK_ACTIVITIES.filter((a) => a.client_id === clientId) : MOCK_ACTIVITIES;
    return list.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const parsed: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const all = [...parsed, ...MOCK_ACTIVITIES];
    const filtered = clientId ? all.filter((a: ActivityLogEntry) => a.client_id === clientId) : all;
    return filtered.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  } catch {
    const list = clientId ? MOCK_ACTIVITIES.filter((a) => a.client_id === clientId) : MOCK_ACTIVITIES;
    return list.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }
}

export function saveLocalActivity(activity: ActivityLogEntry): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const parsed: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const updated = [activity, ...parsed.filter((a) => a.id !== activity.id)];
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save local activity:", err);
  }
}

export function deleteLocalActivity(activityId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const parsed: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const updated = parsed.filter((a) => a.id !== activityId);
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete local activity:", err);
  }
}

const LOCAL_PROJECTS_KEY = "xunique_custom_projects";

export function getLocalProjects(): Project[] {
  if (typeof window === "undefined") return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return MOCK_PROJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const customIds = new Set(parsed.map((p: Project) => p.id));
      const remainingDefaults = MOCK_PROJECTS.filter((p) => !customIds.has(p.id));
      return [...parsed, ...remainingDefaults];
    }
    return MOCK_PROJECTS;
  } catch {
    return MOCK_PROJECTS;
  }
}

export function saveLocalProject(project: Project): Project[] {
  if (typeof window === "undefined") return [project, ...MOCK_PROJECTS];
  try {
    const current = getLocalProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    let updated: Project[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = project;
    } else {
      updated = [project, ...current];
    }
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [project, ...MOCK_PROJECTS];
  }
}

export function deleteLocalProject(projectId: string): Project[] {
  if (typeof window === "undefined") return MOCK_PROJECTS.filter((p) => p.id !== projectId);
  try {
    const current = getLocalProjects();
    const updated = current.filter((p) => p.id !== projectId);
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return MOCK_PROJECTS.filter((p) => p.id !== projectId);
  }
}

const LOCAL_TASKS_KEY = "xunique_custom_tasks";

export function getLocalTasks(projectId?: string): Task[] {
  if (typeof window === "undefined") {
    return projectId ? MOCK_TASKS.filter((t) => t.project_id === projectId) : MOCK_TASKS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed: Task[] = raw ? JSON.parse(raw) : [];
    const customIds = new Set(parsed.map((t) => t.id));
    const all = [...parsed, ...MOCK_TASKS.filter((t) => !customIds.has(t.id))];
    return projectId ? all.filter((t) => t.project_id === projectId) : all;
  } catch {
    return projectId ? MOCK_TASKS.filter((t) => t.project_id === projectId) : MOCK_TASKS;
  }
}

export function saveLocalTask(task: Task): Task[] {
  if (typeof window === "undefined") return [task, ...MOCK_TASKS];
  try {
    const current = getLocalTasks();
    const existingIndex = current.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = task;
    } else {
      updated = [task, ...current];
    }
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [task, ...MOCK_TASKS];
  }
}

export function deleteLocalTask(taskId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalTasks();
    const updated = current.filter((t) => t.id !== taskId);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete local task:", err);
  }
}

const LOCAL_INVOICES_KEY = "xunique_custom_invoices";

export function getLocalInvoices(): Invoice[] {
  if (typeof window === "undefined") return MOCK_INVOICES;
  try {
    const raw = localStorage.getItem(LOCAL_INVOICES_KEY);
    if (!raw) return MOCK_INVOICES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const customIds = new Set(parsed.map((i: Invoice) => i.id));
      const remainingDefaults = MOCK_INVOICES.filter((i) => !customIds.has(i.id));
      return [...parsed, ...remainingDefaults];
    }
    return MOCK_INVOICES;
  } catch {
    return MOCK_INVOICES;
  }
}

export function saveLocalInvoice(invoice: Invoice): Invoice[] {
  if (typeof window === "undefined") return [invoice, ...MOCK_INVOICES];
  try {
    const current = getLocalInvoices();
    const existingIndex = current.findIndex((i) => i.id === invoice.id);
    let updated: Invoice[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = invoice;
    } else {
      updated = [invoice, ...current];
    }
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [invoice, ...MOCK_INVOICES];
  }
}

export function deleteLocalInvoice(invoiceId: string): Invoice[] {
  if (typeof window === "undefined") return MOCK_INVOICES.filter((i) => i.id !== invoiceId);
  try {
    const current = getLocalInvoices();
    const updated = current.filter((i) => i.id !== invoiceId);
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return MOCK_INVOICES.filter((i) => i.id !== invoiceId);
  }
}

export const MOCK_AGREEMENTS: Agreement[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    agreement_number: "AGR-2026-001",
    client_id: "c0000000-0000-0000-0000-000000000001",
    project_name: "FinTech Compliance & Core Portal Web App",
    title: "Software Development & Architecture Master Agreement",
    effective_date: "2026-08-15",
    completion_date: "2026-11-30",
    total_fee: 450000,
    payment_terms: "50% upfront retainer prior to development kickoff, 50% upon final milestone inspection and code delivery.",
    scope_of_work: "Full-stack React & Next.js frontend, secure REST APIs, automated transaction monitoring dashboard, and Supabase database architecture with strict Row Level Security.",
    warranty_days: 14,
    special_terms: "All cloud hosting and external infrastructure costs to be directly billed to and managed by Client.",
    status: "active",
    created_at: "2026-08-15T10:00:00Z",
    client: MOCK_CLIENTS[0],
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    agreement_number: "AGR-2026-002",
    client_id: "c0000000-0000-0000-0000-000000000002",
    project_name: "Patient Analytics Dashboard & FHIR Sync",
    title: "Healthcare Analytics Platform Engineering Agreement",
    effective_date: "2026-08-20",
    completion_date: "2026-12-15",
    total_fee: 650000,
    payment_terms: "40% advance retainer upon contract execution, 30% upon Milestone 1 (FHIR data pipeline), 30% upon final production deployment.",
    scope_of_work: "Development of HIPAA-compliant analytics dashboard, secure practitioner authentication, patient cohort reporting modules, and synthetic data ingestion pipeline.",
    warranty_days: 14,
    special_terms: "Client holds exclusive responsibility for all clinical compliance, HIPAA/NABH patient consents, and medical data governance.",
    status: "signed",
    created_at: "2026-08-20T11:30:00Z",
    client: MOCK_CLIENTS[1],
  },
];

const LOCAL_AGREEMENTS_KEY = "xunique_custom_agreements";

export function getLocalAgreements(): Agreement[] {
  if (typeof window === "undefined") return MOCK_AGREEMENTS;
  try {
    const raw = localStorage.getItem(LOCAL_AGREEMENTS_KEY);
    if (!raw) return MOCK_AGREEMENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map((a: Agreement) => {
        if (a.special_terms && a.special_terms.includes("(AWS, Supabase, Vercel)")) {
          return {
            ...a,
            special_terms: a.special_terms
              .replace(/\s*\(AWS,\s*Supabase,\s*Vercel\):?/gi, "")
              .replace(/AWS,\s*Supabase,\s*Vercel:?/gi, "")
              .trim(),
          };
        }
        return a;
      });
      const customIds = new Set(sanitized.map((a: Agreement) => a.id));
      const remainingDefaults = MOCK_AGREEMENTS.filter((a) => !customIds.has(a.id));
      return [...sanitized, ...remainingDefaults];
    }
    return MOCK_AGREEMENTS;
  } catch {
    return MOCK_AGREEMENTS;
  }
}

export function saveLocalAgreement(agreement: Agreement): Agreement[] {
  if (typeof window === "undefined") return [agreement, ...MOCK_AGREEMENTS];
  try {
    const current = getLocalAgreements();
    const existingIndex = current.findIndex((a) => a.id === agreement.id);
    let updated: Agreement[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = agreement;
    } else {
      updated = [agreement, ...current];
    }
    localStorage.setItem(LOCAL_AGREEMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [agreement, ...MOCK_AGREEMENTS];
  }
}

export function deleteLocalAgreement(agreementId: string): Agreement[] {
  if (typeof window === "undefined") return MOCK_AGREEMENTS.filter((a) => a.id !== agreementId);
  try {
    const current = getLocalAgreements();
    const updated = current.filter((a) => a.id !== agreementId);
    localStorage.setItem(LOCAL_AGREEMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return MOCK_AGREEMENTS.filter((a) => a.id !== agreementId);
  }
}

export function getNextInvoiceNumber(existingInvoices?: Invoice[]): string {
  const list = existingInvoices && existingInvoices.length > 0 ? existingInvoices : getLocalInvoices();
  const currentYear = new Date().getFullYear();

  let maxSeq = 0;
  for (const inv of list) {
    if (!inv.invoice_number) continue;
    const matchYear = inv.invoice_number.match(new RegExp(`^INV-${currentYear}-(\\d+)`, "i"));
    if (matchYear) {
      const num = parseInt(matchYear[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    } else {
      const matchAny = inv.invoice_number.match(/^INV-(?:.*-)?(\d+)$/i);
      if (matchAny) {
        const num = parseInt(matchAny[1], 10);
        if (!isNaN(num) && num > maxSeq && num < 10000) {
          maxSeq = num;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(3, "0");
  return `INV-${currentYear}-${padded}`;
}

export function getNextAgreementNumber(existingAgreements?: Agreement[]): string {
  const list = existingAgreements && existingAgreements.length > 0 ? existingAgreements : getLocalAgreements();
  const currentYear = new Date().getFullYear();

  let maxSeq = 0;
  for (const agr of list) {
    if (!agr.agreement_number) continue;
    const matchYear = agr.agreement_number.match(new RegExp(`^AGR-${currentYear}-(\\d+)`, "i"));
    if (matchYear) {
      const num = parseInt(matchYear[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    } else {
      const matchAny = agr.agreement_number.match(/^AGR-(?:.*-)?(\d+)$/i);
      if (matchAny) {
        const num = parseInt(matchAny[1], 10);
        if (!isNaN(num) && num > maxSeq && num < 10000) {
          maxSeq = num;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(3, "0");
  return `AGR-${currentYear}-${padded}`;
}

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-001",
    title: "Why Next.js & React Server Components are the Gold Standard for Agency Platforms",
    slug: "why-nextjs-server-components-gold-standard",
    excerpt: "How eliminating bloated client JavaScript bundles and embracing streaming SSR enables sub-second page loads and superior Core Web Vitals for production client projects.",
    content: `## The Modern Web Architecture Paradigm Shift

For years, the standard approach to building modern web applications involved client-heavy Single Page Application (SPA) architectures. Frameworks like standard React or Vue shipped tens of megabytes of bundled JavaScript directly to user devices. While this delivered dynamic client interactions, it created major drawbacks: **sluggish First Contentful Paint (FCP)**, **severe layout shifts (CLS)**, and **subpar search engine indexing**.

At **Xunique Labs**, we made an architectural commitment early on: every client website and application must load under 1 second and pass all Core Web Vitals thresholds out of the box. That is why Next.js with React Server Components (RSC) is our default framework.

---

### 1. Zero-Bundle-Size Server Components

React Server Components execute entirely on the server. Their dependencies—whether large markdown parsers, syntax highlighters, or date-formatting libraries—never leave the server environment.

\`\`\`tsx
// This component runs strictly on the edge server.
// No markdown libraries are ever transmitted to the user's browser!
import { compileMarkdown } from "@/lib/markdown";

export async function ArticleBody({ rawContent }: { rawContent: string }) {
  const html = await compileMarkdown(rawContent);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
\`\`\`

By offloading rendering logic to the server, we reduced average initial JavaScript payload sizes for our client builds from **1.4MB down to under 80KB**.

---

### 2. Streaming SSR and Progressive Hydration

With traditional Server-Side Rendering, the server had to resolve every database query and third-party API request before sending a single byte of HTML back to the browser. If a payment gateway check or live stats query took 800ms, the entire screen remained blank.

Next.js streaming solves this through React Suspense boundaries:

* **Instant Skeleton shell:** The browser receives the navigation bar, layout, and document structure in under 50 milliseconds.
* **Streamed chunks:** Heavy data widgets stream in progressively as their promises resolve.
* **Selective Hydration:** Only interactive buttons and forms hydrate client-side event handlers, leaving static text and images completely unencumbered.

---

### 3. Native Technical SEO & OpenGraph Generation

Search engine crawlers, especially Googlebot, prioritize pages that provide comprehensive pre-rendered semantic HTML. With Next.js dynamic metadata functions, our studio automatically generates:
- Verified JSON-LD schema graphs
- Dynamic OpenGraph and Twitter card previews with custom font overlays
- Canonical URLs and automated XML sitemaps

> "Software drawn to spec means building architectures that endure scale without degrading performance."

When you partner with Xunique Labs, your platform isn't patched together with bloated third-party plugins. It is engineered with architectural rigor, ensuring blazing fast speeds that boost conversion rates and domain authority.`,
    category: "Engineering",
    tags: ["Next.js", "React", "Full-Stack", "Architecture", "Performance"],
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    author_name: "Sayyed Abdul Ali",
    author_avatar: null,
    status: "published",
    read_time_minutes: 6,
    views_count: 482,
    featured: true,
    created_at: "2026-08-20T10:00:00Z",
    published_at: "2026-08-21T09:00:00Z",
  },
  {
    id: "blog-002",
    title: "From Spec to Production: Inside Our Blueprint Architecture Methodology",
    slug: "from-spec-to-production-blueprint-methodology",
    excerpt: "Why our studio treats software development like precision engineering — drafting rigorous architectural blueprints before laying a single line of production code.",
    content: `## The Fallacy of "Move Fast and Break Things"

In typical digital agencies, projects begin with excitement and vague wireframes, only to dissolve into scope creep, missed deadlines, and unmaintainable spaghetti code. 

At **Xunique Labs**, we operate on a fundamentally different philosophy: **Software, drawn to spec — not shipped by guesswork.**

Borrowing directly from architectural and civil engineering principles, we introduce a structured, five-stage delivery cadence that protects both timeline and capital.

---

### Stage 1: The Functional Specification Brief

Before Figma files are opened or repositories initialized, we draft a comprehensive technical specification:
1. **Entity-Relationship Diagrams (ERD):** Exactly how data models, relational keys, and constraints interact.
2. **Access Control Matrix:** Defining administrative, manager, and developer permission boundaries using PostgreSQL Row-Level Security (RLS).
3. **Third-Party Boundary Contracts:** Documenting payload schemas for payment gateways (Stripe, Razorpay), authentication webhooks, and transactional messaging.

---

### Stage 2: Low-Latency Wireframing & Design Tokens

We don't build generic web pages. We create bespoke design systems backed by strict CSS design tokens:
- Structured typography scales (Lora, Inter, IBM Plex Mono)
- High-contrast terracotta accents and blueprint grid foundations
- Native keyboard navigation and accessible focus management

---

### Stage 3: Modular Sprint Execution

Our sprints are organized around working vertical slices. Instead of building "the database layer for 3 weeks" while stakeholders see nothing, every sprint produces a clickable, interactive deployment link where clients can verify actual business logic in real time.

---

### Stage 4: Strict Quality & Security Audits

Before production cutover, every codebase undergoes:
- **Lighthouse CI:** Enforcing a minimum 95+ score on Performance, Accessibility, Best Practices, and SEO.
- **SQL RLS Verification:** Ensuring no client can query another tenant's financial or project records.
- **Cross-Browser Layout Testing:** Testing across Safari iOS, Android Chrome, Chromium desktop, and Firefox.

The result is predictable delivery, transparent milestones, and zero post-launch surprises.`,
    category: "Architecture",
    tags: ["Product Strategy", "System Design", "Agile", "Methodology"],
    cover_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    author_name: "Sayyed Abdul Ali",
    author_avatar: null,
    status: "published",
    read_time_minutes: 5,
    views_count: 310,
    featured: false,
    created_at: "2026-08-25T11:30:00Z",
    published_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "blog-003",
    title: "Mastering Core Web Vitals: Achieving 100/100 Lighthouse Performance",
    slug: "mastering-core-web-vitals-100-lighthouse",
    excerpt: "A practical, battle-tested guide to diagnosing layout shifts (CLS), reducing largest contentful paint (LCP), and minimizing interaction delays on high-traffic web platforms.",
    content: `## Speed is a Feature, Not an Afterthought

Every millisecond of delay directly erodes user engagement and search visibility. Google's ranking algorithms treat Core Web Vitals as critical ranking signals. If your website takes 3+ seconds to render on mobile 4G, over 50% of visitors abandon the page before reading your value proposition.

Here is the exact playbook we use at **Xunique Labs** to reliably score 100/100 across Lighthouse metrics on client deployments.

---

### 1. Largest Contentful Paint (LCP) < 1.2s

LCP measures when the main hero content or graphic is rendered on the screen.

**How we optimize LCP:**
- **Preload Critical Assets:** Mark hero images and primary font subsets with \`rel="preload"\` or Next.js \`priority\` attributes.
- **Modern Formats:** Serve images exclusively in WebP and AVIF with appropriate resolution srcset.
- **Edge CDN Caching:** Serve static assets from global Cloudflare or Vercel edge nodes located geographically close to the user.

---

### 2. Cumulative Layout Shift (CLS) = 0.000

Nothing frustrates users more than attempting to click a button only for an unstyled banner or delayed image to suddenly push the layout downward.

**How we guarantee zero CLS:**
- Always define explicit \`aspect-ratio\` or \`width\` and \`height\` attributes on all image containers.
- Use font-display: swap with matched font fallback metrics (\`size-adjust\`, \`ascent-override\`) to prevent layout jumping when custom web fonts finish downloading.
- Reserve container heights for dynamic elements like live clocks or notification counters.

---

### 3. Interaction to Next Paint (INP) < 100ms

Replacing First Input Delay (FID), INP evaluates overall responsiveness across every click, tap, and keyboard interaction on the page.

**Our INP rules:**
- Break up long-running JavaScript execution tasks using \`requestIdleCallback\` or web workers.
- Avoid heavy React state recalculations inside high-frequency scroll or resize listeners; use native \`IntersectionObserver\` and CSS transforms instead.

---

### Summary Checklist

| Metric | Target | Xunique Labs Average |
| :--- | :--- | :--- |
| **LCP** | < 2.5s | **0.8s - 1.1s** |
| **CLS** | < 0.1 | **0.00** |
| **INP** | < 200ms | **< 45ms** |
| **FCP** | < 1.8s | **0.5s** |

When your technical foundation is fast, your marketing spend works twice as hard.`,
    category: "Performance",
    tags: ["Core Web Vitals", "Lighthouse", "SEO", "Optimization", "CSS"],
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    author_name: "Sayyed Abdul Ali",
    author_avatar: null,
    status: "published",
    read_time_minutes: 7,
    views_count: 524,
    featured: false,
    created_at: "2026-08-28T14:00:00Z",
    published_at: "2026-08-29T10:00:00Z",
  },
  {
    id: "blog-004",
    title: "Cross-Platform Mobile Engineering: Flutter vs. React Native in 2026",
    slug: "flutter-vs-react-native-cross-platform-2026",
    excerpt: "An architectural comparison between Flutter's compiled Impeller pipeline and React Native's new architecture with Hermes for commercial enterprise client projects.",
    content: `## Choosing the Right Mobile Foundation

When clients approach **Xunique Labs** for mobile application engineering, one of the earliest technical decisions is whether to build with **Flutter (Dart)** or **React Native (TypeScript)**.

Both frameworks allow deploying to iOS and Android from a shared codebase, but their rendering philosophies and operational trade-offs differ significantly.

---

### 1. The Rendering Engine: Canvas vs. Native Host Components

* **Flutter with Impeller:** Flutter bypasses native iOS UIKit and Android View widgets entirely. It paints every pixel directly onto a GPU canvas using its next-generation Impeller graphics engine. This guarantees 100% pixel-perfect uniformity across devices and operating system updates.
* **React Native:** React Native acts as an orchestrator. Your JavaScript logic communicates over JSI (JavaScript Interface) with real native host UI components (e.g. \`UICollectionView\` on iOS, \`RecyclerView\` on Android).

---

### 2. Developer Velocity & Code Sharing

If your project already features a complex Next.js or React web dashboard—like many of our SaaS client engagements—**React Native** offers unparalleled code reuse. Data fetching hooks, state management stores (Zustand, React Query), and TypeScript data models can be shared almost verbatim between web and mobile.

Conversely, for applications requiring heavy custom animations, bespoke financial charts, or complex offline hardware synchronization, **Flutter** delivers superior rendering performance and rock-solid cross-platform fidelity.

---

### Decision Matrix

| Requirement | Preferred Engine | Rationale |
| :--- | :--- | :--- |
| **SaaS Companion App** | React Native | Maximum shared TypeScript logic with existing web dashboard |
| **High-Performance Consumer App** | Flutter | Direct GPU rendering with zero micro-stutter |
| **Enterprise Internal Tools** | React Native | Seamless native biometric and MDM integrations |
| **Custom Canvas / Graphic Apps** | Flutter | Consistent pixel reproduction across Android manufacturers |

At Xunique Labs, our team is fluent in both ecosystems, architecting the exact solution tailored to your product goals and maintenance timeline.`,
    category: "Mobile Development",
    tags: ["Flutter", "React Native", "iOS", "Android", "Mobile"],
    cover_image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    author_name: "Sayyed Abdul Ali",
    author_avatar: null,
    status: "published",
    read_time_minutes: 8,
    views_count: 673,
    featured: false,
    created_at: "2026-09-01T16:00:00Z",
    published_at: "2026-09-02T11:00:00Z",
  },
];

const LOCAL_STORAGE_BLOGS_KEY = "xunique_blog_posts";

export function getLocalBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return MOCK_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BLOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(MOCK_BLOG_POSTS));
      return MOCK_BLOG_POSTS;
    }
    return JSON.parse(raw) as BlogPost[];
  } catch {
    return MOCK_BLOG_POSTS;
  }
}

export function getLocalBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getLocalBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export function saveLocalBlogPost(postData: Partial<BlogPost> & { title: string }): BlogPost {
  const posts = getLocalBlogPosts();
  const now = new Date().toISOString();

  // Generate slug if not provided
  const slug =
    postData.slug?.trim() ||
    postData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

  // Auto calculate reading time based on content words
  const wordCount = (postData.content || "").trim().split(/\s+/).length;
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  if (postData.id) {
    const existingIndex = posts.findIndex((p) => p.id === postData.id);
    if (existingIndex >= 0) {
      const updated: BlogPost = {
        ...posts[existingIndex],
        ...postData,
        slug,
        read_time_minutes: postData.read_time_minutes || calculatedReadTime,
        updated_at: now,
        published_at:
          postData.status === "published" && !posts[existingIndex].published_at
            ? now
            : posts[existingIndex].published_at,
      };
      posts[existingIndex] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(posts));
      }
      return updated;
    }
  }

  const newPost: BlogPost = {
    id: postData.id || `blog-${Date.now()}`,
    title: postData.title,
    slug,
    excerpt: postData.excerpt || "",
    content: postData.content || "",
    category: postData.category || "Engineering",
    tags: postData.tags || ["Web Development"],
    cover_image: postData.cover_image || null,
    author_name: postData.author_name || "Sayyed Abdul Ali",
    author_avatar: postData.author_avatar || null,
    status: postData.status || "draft",
    read_time_minutes: postData.read_time_minutes || calculatedReadTime,
    views_count: postData.views_count || 0,
    featured: postData.featured ?? false,
    created_at: now,
    published_at: postData.status === "published" ? now : null,
    updated_at: now,
  };

  posts.unshift(newPost);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(posts));
  }
  return newPost;
}

export function deleteLocalBlogPost(id: string): void {
  const posts = getLocalBlogPosts().filter((p) => p.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(posts));
  }
}

export function incrementLocalBlogPostViews(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const posts = getLocalBlogPosts();
    const post = posts.find((p) => p.slug === slug);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(posts));
    }
  } catch {}
}


