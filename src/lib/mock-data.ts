import { Client, Contact, Project, Task, Milestone, Invoice, ActivityLogEntry, Profile, Agreement } from "@/types/database.types";

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
    company_name: "Acme FinTech Corp",
    industry: "Financial Services",
    website: "https://acmefin.example.com",
    status: "active",
    lead_source: "referral",
    tags: ["Fintech", "React", "Cloud"],
    account_manager_id: "00000000-0000-0000-0000-000000000001",
    account_manager: MOCK_PROFILES[0],
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
    company_name: "Lumina Health Labs",
    industry: "Healthcare & Biotech",
    website: "https://luminahealth.example.com",
    status: "negotiation",
    lead_source: "inbound",
    tags: ["Healthcare", "HIPAA", "Mobile"],
    account_manager_id: "00000000-0000-0000-0000-000000000002",
    account_manager: MOCK_PROFILES[1],
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
  if (typeof window === "undefined") return [client, ...MOCK_CLIENTS];
  try {
    const current = getLocalClients();
    const existingIndex = current.findIndex((c) => c.id === client.id);
    let updated: Client[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = client;
    } else {
      updated = [client, ...current];
    }
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [client, ...MOCK_CLIENTS];
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

