import { Client, Contact, Project, Task, Milestone, Invoice, ActivityLogEntry, Profile, Agreement, Proposal, BlogPost, CaseFile, DevelopmentPlan } from "@/types/database.types";

export const MOCK_PROFILES: Profile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@xuniquelabs.com",
    full_name: "Administrator",
    role: "admin",
    avatar_url: null,
    phone: "+91 (80) 4920-1100",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "support@xuniquelabs.com",
    full_name: "Account Manager",
    role: "account_manager",
    avatar_url: null,
    phone: "+91 (80) 4920-1100",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "dev@xuniquelabs.com",
    full_name: "Developer",
    role: "developer",
    avatar_url: null,
    phone: "+91 (80) 4920-1100",
    theme_preference: "system",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export function isMockId(str: string | null | undefined): boolean {
  if (!str) return false;
  return (
    str.startsWith("c0000000-") ||
    str.startsWith("e0000000-") ||
    str.startsWith("f0000000-") ||
    str.startsWith("i0000000-") ||
    str.startsWith("a0000000-") ||
    str.startsWith("ac000000-") ||
    str.startsWith("d0000000-")
  );
}

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_MILESTONES: Milestone[] = [];

export const MOCK_TASKS: Task[] = [];

export const MOCK_INVOICES: Invoice[] = [];

export const MOCK_ACTIVITIES: ActivityLogEntry[] = [];

const LOCAL_CLIENTS_KEY = "xunique_custom_clients";
const DELETED_CLIENT_IDS_KEY = "xunique_deleted_client_ids";

export function getDeletedClientIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_CLIENT_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markClientDeleted(clientId: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedClientIds();
    set.add(clientId);
    localStorage.setItem(DELETED_CLIENT_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function mergeAndDeduplicateClients(
  remoteClients: Client[] = [],
  localClients: Client[] = []
): Client[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: Client[] = [];
  const deleted = getDeletedClientIds();

  // 1. Remote clients take first priority
  for (const c of remoteClients) {
    if (!c || !c.id || deleted.has(c.id)) continue;
    const name = (c.client_name || c.company_name || "").trim().toLowerCase();
    seenIds.add(c.id);
    if (name) seenNames.add(name);
    result.push({
      ...c,
      client_name: c.client_name || c.company_name || "",
      company_name: c.company_name || c.client_name || "",
    });
  }

  // 2. Add local clients only if not already seen by ID or by company/client name
  for (const c of localClients) {
    if (!c || !c.id || deleted.has(c.id) || isMockId(c.id)) continue;
    const name = (c.client_name || c.company_name || "").trim().toLowerCase();
    if (seenIds.has(c.id)) continue;
    if (name && seenNames.has(name)) continue;
    seenIds.add(c.id);
    if (name) seenNames.add(name);
    result.push({
      ...c,
      client_name: c.client_name || c.company_name || "",
      company_name: c.company_name || c.client_name || "",
    });
  }

  return result;
}

export function getLocalClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const deleted = getDeletedClientIds();
    const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const deduped: Client[] = [];

    for (const c of parsed) {
      if (!c || !c.id || deleted.has(c.id) || isMockId(c.id)) continue;
      const name = (c.client_name || c.company_name || "").trim().toLowerCase();
      if (seenIds.has(c.id)) continue;
      if (name && seenNames.has(name)) continue;
      seenIds.add(c.id);
      if (name) seenNames.add(name);
      deduped.push({
        ...c,
        client_name: c.client_name || c.company_name,
        company_name: c.company_name || c.client_name,
      });
    }

    return deduped;
  } catch {
    return [];
  }
}

export function saveLocalClient(client: Client): Client[] {
  const normalized: Client = {
    ...client,
    client_name: client.client_name || client.company_name,
    company_name: client.company_name || client.client_name || "",
  };
  if (typeof window === "undefined") return [normalized];
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
    return [normalized];
  }
}

export function deleteLocalClient(clientId: string): Client[] {
  markClientDeleted(clientId);
  if (typeof window === "undefined") return [];
  try {
    const current = getLocalClients();
    const updated = current.filter((c) => c.id !== clientId);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const parsed: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const nonMock = Array.isArray(parsed) ? parsed.filter((a: ActivityLogEntry) => !isMockId(a.id)) : [];
    const filtered = clientId ? nonMock.filter((a: ActivityLogEntry) => a.client_id === clientId) : nonMock;
    return filtered.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  } catch {
    return [];
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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((p: Project) => !isMockId(p.id));
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalProject(project: Project): Project[] {
  if (typeof window === "undefined") return [project];
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
    return [project];
  }
}

export function deleteLocalProject(projectId: string): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getLocalProjects();
    const updated = current.filter((p) => p.id !== projectId);
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

const LOCAL_TASKS_KEY = "xunique_custom_tasks";

export function getLocalTasks(projectId?: string): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed: Task[] = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(parsed) ? parsed.filter((t: Task) => !isMockId(t.id)) : [];
    return projectId ? filtered.filter((t) => t.project_id === projectId) : filtered;
  } catch {
    return [];
  }
}

export function saveLocalTask(task: Task): Task[] {
  if (typeof window === "undefined") return [task];
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
    return [task];
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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_INVOICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((i: Invoice) => !isMockId(i.id));
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalInvoice(invoice: Invoice): Invoice[] {
  if (typeof window === "undefined") return [invoice];
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
    return [invoice];
  }
}

export function deleteLocalInvoice(invoiceId: string): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getLocalInvoices();
    const updated = current.filter((i) => i.id !== invoiceId);
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export const MOCK_AGREEMENTS: Agreement[] = [];

const LOCAL_AGREEMENTS_KEY = "xunique_custom_agreements";

export function getLocalAgreements(): Agreement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_AGREEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((a: Agreement) => !isMockId(a.id));
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalAgreement(agreement: Agreement): Agreement[] {
  if (typeof window === "undefined") return [agreement];
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
    return [agreement];
  }
}

export function deleteLocalAgreement(agreementId: string): Agreement[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getLocalAgreements();
    const updated = current.filter((a) => a.id !== agreementId);
    localStorage.setItem(LOCAL_AGREEMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export const MOCK_PROPOSALS: Proposal[] = [];

const LOCAL_PROPOSALS_KEY = "xunique_custom_proposals";

export function getLocalProposals(): Proposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROPOSALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((p: Proposal) => !isMockId(p.id));
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalProposal(proposal: Proposal): Proposal[] {
  if (typeof window === "undefined") return [proposal];
  try {
    const current = getLocalProposals();
    const existingIndex = current.findIndex((p) => p.id === proposal.id);
    let updated: Proposal[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = proposal;
    } else {
      updated = [proposal, ...current];
    }
    localStorage.setItem(LOCAL_PROPOSALS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [proposal];
  }
}

export function deleteLocalProposal(proposalId: string): Proposal[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getLocalProposals();
    const updated = current.filter((p) => p.id !== proposalId);
    localStorage.setItem(LOCAL_PROPOSALS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
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

export function incrementLocalBlogPostViews(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const posts = getLocalBlogPosts();
    const post = posts.find((p) => p.slug === slug);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(posts));
      // Dispatch event for real-time reactivity across tabs & portal dashboard
      window.dispatchEvent(
        new CustomEvent("xunique_blog_views_updated", {
          detail: { slug, views_count: post.views_count },
        })
      );
      return post.views_count;
    }
  } catch {}
  return 0;
}

/* ==========================================================================
   CASE FILES (PORTFOLIO WORK) STORAGE & HELPERS
   ========================================================================== */

export const LOCAL_STORAGE_CASE_FILES_KEY = "xunique_custom_case_files";

export const DEFAULT_CASE_FILES: CaseFile[] = [
  {
    id: "case-ourhomeindia",
    case_code: "CASE — PROP-01",
    title: "OurHomeIndia",
    client_name: "OurHomeIndia Realty",
    description: "A pan-India real estate discovery platform — verified buy/rent listings, an advisor enquiry flow, and property-owner onboarding.",
    live_url: "https://www.ourhomeindia.com/",
    category: "Real Estate",
    tags: ["Web Platform", "Property Search", "Lead Gen"],
    figure_type: "grid",
    featured: true,
    display_order: 1,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "case-mrnothing",
    case_code: "CASE — RTL-02",
    title: "Mr.Nothing",
    client_name: "Mr.Nothing Brand",
    description: "A curated lifestyle showcase spanning clothing, electronics, and home & kitchen essentials, built for fast browsing and discovery.",
    live_url: "https://mrnothing.in/",
    category: "E-Commerce",
    tags: ["E-commerce", "Catalog UI", "Payment Flow"],
    figure_type: "circle",
    featured: true,
    display_order: 2,
    created_at: "2026-01-15T12:00:00Z",
    updated_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "case-wasimhealthcare",
    case_code: "CASE — MED-03",
    title: "Wasim Health Care",
    client_name: "Wasim Health Care & Services",
    description: "An international medical tourism & surgery portal connecting global patients with India's top JCI-accredited hospitals, treatments, and quotes.",
    live_url: "https://wasimhealthcare.com/",
    category: "Healthcare",
    tags: ["Medical Portal", "Hospital Network", "Quote & Care Flow"],
    figure_type: "cross",
    featured: true,
    display_order: 3,
    created_at: "2026-01-20T14:00:00Z",
    updated_at: "2026-01-20T14:00:00Z",
  },
  {
    id: "case-freedomnex",
    case_code: "CASE — EDU-04",
    title: "FreedomNex",
    client_name: "FreedomNex Philosophy",
    description: "A digital learning sanctuary for classical Islamic philosophy — structured curricula, a wisdom anthology, and a reverent manuscript-inspired interface.",
    live_url: "https://freedomnex.com/",
    category: "Education",
    tags: ["Content Platform", "Learning Paths", "Manuscript UI"],
    figure_type: "wave",
    featured: true,
    display_order: 4,
    created_at: "2026-01-25T16:00:00Z",
    updated_at: "2026-01-25T16:00:00Z",
  },
];

export function getLocalCaseFiles(): CaseFile[] {
  if (typeof window === "undefined") {
    return DEFAULT_CASE_FILES;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CASE_FILES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_CASE_FILES_KEY, JSON.stringify(DEFAULT_CASE_FILES));
      return DEFAULT_CASE_FILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a: CaseFile, b: CaseFile) => a.display_order - b.display_order);
    }
    return DEFAULT_CASE_FILES;
  } catch (err) {
    console.error("Error reading local case files:", err);
    return DEFAULT_CASE_FILES;
  }
}

export function saveLocalCaseFile(caseData: Partial<CaseFile> & { title: string }): CaseFile {
  const cases = getLocalCaseFiles();
  const now = new Date().toISOString();

  if (caseData.id) {
    const existingIndex = cases.findIndex((c) => c.id === caseData.id);
    if (existingIndex >= 0) {
      const updated: CaseFile = {
        ...cases[existingIndex],
        ...caseData,
        tags: Array.isArray(caseData.tags) ? caseData.tags : cases[existingIndex].tags,
        updated_at: now,
      };
      cases[existingIndex] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_CASE_FILES_KEY, JSON.stringify(cases));
        window.dispatchEvent(new Event("xunique_site_content_updated"));
      }
      return updated;
    }
  }

  const newCase: CaseFile = {
    id: caseData.id || `case-${Date.now()}`,
    case_code: caseData.case_code || `CASE — DEV-${String(cases.length + 1).padStart(2, "0")}`,
    title: caseData.title,
    client_name: caseData.client_name || null,
    description: caseData.description || "",
    live_url: caseData.live_url || "https://xuniquelabs.com/",
    category: caseData.category || "Web Platform",
    tags: Array.isArray(caseData.tags) && caseData.tags.length > 0 ? caseData.tags : ["Web Platform"],
    figure_type: caseData.figure_type || "blueprint",
    custom_svg: caseData.custom_svg || null,
    image_url: caseData.image_url || null,
    featured: caseData.featured ?? true,
    display_order: caseData.display_order || cases.length + 1,
    created_at: now,
    updated_at: now,
  };

  cases.push(newCase);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_CASE_FILES_KEY, JSON.stringify(cases));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
  return newCase;
}

export function deleteLocalCaseFile(id: string): void {
  const cases = getLocalCaseFiles().filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_CASE_FILES_KEY, JSON.stringify(cases));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
}

export function resetCaseFilesToDefault(): CaseFile[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_CASE_FILES_KEY, JSON.stringify(DEFAULT_CASE_FILES));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
  return DEFAULT_CASE_FILES;
}

/* ==========================================================================
   DEVELOPMENT PLANS (PRICING TIERS) STORAGE & HELPERS
   ========================================================================== */

export const LOCAL_STORAGE_PLANS_KEY = "xunique_custom_plans";

export const DEFAULT_PLANS: DevelopmentPlan[] = [
  {
    id: "plan-starter",
    sheet_code: "SHEET P-01",
    name: "Starter",
    price: "1,999",
    original_price: "2999",
    currency_symbol: "₹",
    price_period: "/-",
    delivery_time: "1–2 Days",
    is_popular: false,
    popular_badge: null,
    is_custom_quote: false,
    features: [
      "Single page high-converting landing page",
      "Mobile, tablet & desktop responsive",
      "WhatsApp & lead capture form integration",
      "Fast page speed & basic SEO configuration",
      "Free deployment & domain setup support",
      "Full source code ownership",
      "14 days post-launch warranty support",
    ],
    cta_text: "Get Started →",
    whatsapp_message: "Hi Xunique Labs, I'm interested in the Starter Plan (₹1,999/- Landing Page, 1–2 Days). How can we proceed further?",
    display_order: 1,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "plan-business",
    sheet_code: "SHEET P-02",
    name: "Business Website",
    price: "7,999",
    original_price: "11999",
    currency_symbol: "₹",
    price_period: "/-",
    delivery_time: "3–5 Days",
    is_popular: true,
    popular_badge: "★ MOST POPULAR",
    is_custom_quote: false,
    features: [
      "Up to 5 custom designed & responsive pages",
      "Next.js / modern high-performance architecture",
      "Bespoke UI/UX design drawn to spec",
      "Interactive inquiry forms & contact dispatch",
      "Google Search & On-Page SEO optimization",
      "Social media, maps & WhatsApp scoping",
      "Ultra-fast loading speed (<1.5s)",
      "30 days dedicated support & revisions",
    ],
    cta_text: "Book Now →",
    whatsapp_message: "Hi Xunique Labs, I'm interested in the Business Website Plan (₹7,999/- Up to 5 Pages, 3–5 Days). Let's discuss and book this project.",
    display_order: 2,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "plan-ecommerce",
    sheet_code: "SHEET P-03",
    name: "E-Commerce Store",
    price: "9,999",
    original_price: "14999",
    currency_symbol: "₹",
    price_period: "/-",
    delivery_time: "7–10 Days",
    is_popular: false,
    popular_badge: null,
    is_custom_quote: false,
    features: [
      "Dynamic product catalog with categories & search",
      "Shopping cart, wishlist & smooth checkout",
      "Payment gateway (Razorpay / Stripe / UPI QR)",
      "Dedicated admin dashboard for products & orders",
      "Automated email confirmations & order tracking",
      "Mobile-optimized high-converting checkout flow",
      "Inventory management & discount coupon system",
      "45 days maintenance & staff onboarding walkthrough",
    ],
    cta_text: "Launch Store →",
    whatsapp_message: "Hi Xunique Labs, I'm interested in the E-Commerce Store Plan (₹9,999/- WooCommerce & Payments, 7–10 Days). Let's launch my store.",
    display_order: 3,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "plan-custom",
    sheet_code: "SHEET P-04",
    name: "Custom Application",
    price: "Custom",
    original_price: null,
    currency_symbol: "",
    price_period: "Scope Based",
    delivery_time: "2–4 Weeks",
    is_popular: false,
    popular_badge: null,
    is_custom_quote: true,
    features: [
      "Full-stack Web Platform or Cross-Platform Mobile App",
      "Custom relational database & scalable backend APIs",
      "Secure user authentication & role-based permissions",
      "Third-party REST/GraphQL APIs & CRM integrations",
      "Production cloud infrastructure (AWS / Vercel / Supabase)",
      "Automated CI/CD deployment pipeline",
      "Comprehensive architectural blueprint & spec docs",
      "Milestone-based delivery & SLA guarantee",
    ],
    cta_text: "Discuss Project →",
    whatsapp_message: "Hi Xunique Labs, I'm looking for a Custom Large-Scale Application Plan (Full-Stack Web/Mobile). Let's discuss our project scope, milestones, and negotiate pricing.",
    display_order: 4,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
];

export function getLocalPlans(): DevelopmentPlan[] {
  if (typeof window === "undefined") {
    return DEFAULT_PLANS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
      return DEFAULT_PLANS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a: DevelopmentPlan, b: DevelopmentPlan) => a.display_order - b.display_order);
    }
    return DEFAULT_PLANS;
  } catch (err) {
    console.error("Error reading local plans:", err);
    return DEFAULT_PLANS;
  }
}

export function saveLocalPlan(planData: Partial<DevelopmentPlan> & { name: string }): DevelopmentPlan {
  const plans = getLocalPlans();
  const now = new Date().toISOString();

  if (planData.id) {
    const existingIndex = plans.findIndex((p) => p.id === planData.id);
    if (existingIndex >= 0) {
      const updated: DevelopmentPlan = {
        ...plans[existingIndex],
        ...planData,
        features: Array.isArray(planData.features) ? planData.features : plans[existingIndex].features,
        updated_at: now,
      };
      plans[existingIndex] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
        window.dispatchEvent(new Event("xunique_site_content_updated"));
      }
      return updated;
    }
  }

  const newPlan: DevelopmentPlan = {
    id: planData.id || `plan-${Date.now()}`,
    sheet_code: planData.sheet_code || `SHEET P-${String(plans.length + 1).padStart(2, "0")}`,
    name: planData.name,
    price: planData.price || "1,999",
    original_price: planData.original_price || null,
    currency_symbol: planData.currency_symbol !== undefined ? planData.currency_symbol : "₹",
    price_period: planData.price_period !== undefined ? planData.price_period : "/-",
    delivery_time: planData.delivery_time || "3–5 Days",
    is_popular: planData.is_popular ?? false,
    popular_badge: planData.popular_badge || (planData.is_popular ? "★ POPULAR" : null),
    is_custom_quote: planData.is_custom_quote ?? false,
    features: Array.isArray(planData.features) && planData.features.length > 0 ? planData.features : ["Responsive Design", "Full Code Ownership"],
    cta_text: planData.cta_text || "Get Started →",
    whatsapp_message: planData.whatsapp_message || null,
    display_order: planData.display_order || plans.length + 1,
    created_at: now,
    updated_at: now,
  };

  plans.push(newPlan);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
  return newPlan;
}

export function deleteLocalPlan(id: string): void {
  const plans = getLocalPlans().filter((p) => p.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
}

export function resetPlansToDefault(): DevelopmentPlan[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
    window.dispatchEvent(new Event("xunique_site_content_updated"));
  }
  return DEFAULT_PLANS;
}


