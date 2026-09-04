# Build Prompt: Xunique Labs Internal Client Management App

## Project Overview
Build a multi-user, internal-only client management web app for Xunique Labs, a software development agency. The app replaces WhatsApp (internal team coordination), Excel (client/financial tracking), and Trello (project/task management) with a single unified system. There is **no client-facing access** — clients are never logged into or communicating through this app. All client communication happens externally (WhatsApp, email, calls) and is manually logged into the app afterward.

## Tech Stack
- **Frontend**: Next.js, hosted on Cloudflare Pages (free tier)
- **Backend**: None — no separate server. The frontend communicates directly with Supabase via its client SDK.
- **Database & Auth**: Supabase (free tier) — Postgres database, Supabase Auth for login, Supabase Storage for files
- **Access control**: Enforced entirely through Postgres Row Level Security (RLS) policies, not application code
- **Budget constraint**: Every service used must operate within its free tier. No paid infrastructure.

## User Roles
Three internal roles, enforced via RLS:
1. **Admin** — full access to everything: all clients, all financials, all team management, all settings
2. **Account Manager** — full access to clients/projects they are assigned to; can see financials for their own clients; cannot see other AMs' clients unless explicitly shared
3. **Developer / Team Member** — access only to tasks and projects they're assigned to; no access to financials, contracts, or client-level financial data

Public self-signup must be disabled. Team members are invited by an Admin.

## Core Modules

### 1. Client & Contact Management
- Client profile: company name, industry, website, primary contacts (name, role, email, phone, preferred contact channel)
- Support multiple contacts per client
- Client status pipeline: Lead → Negotiation → Active → On Hold → Past/Churned
- Lead source field (referral, Upwork, LinkedIn, inbound, cold outreach, other)
- Tags/categories (industry, project type)
- Full activity/interaction timeline per client — manually logged entries (calls, meetings, WhatsApp/email summaries, key decisions), timestamped and attributed to the team member who logged them

### 2. Project Management
- Each client can have multiple projects
- Project fields: name, scope/description, tech stack, timeline (start/end), budget, status
- Kanban board per project: To Do / In Progress / Review / Done (customizable columns)
- Tasks: title, description, assignee, due date, priority, status, linked to a project
- Milestones/phases with due dates, independent of individual tasks
- Team members assigned per project with role (lead, contributor, reviewer)
- Calendar/timeline view showing deadlines across all active projects

### 3. Internal Team Collaboration
- Comment threads on individual tasks and projects (internal only — never visible to clients)
- @mentions that trigger in-app notifications
- Notes per client/project visible to the team
- This is the WhatsApp replacement for internal coordination — it is NOT a client communication channel

### 4. Financials & Invoicing
- Invoice generation tied to project milestones or recurring retainers
- Invoice fields: client, line items, amount, due date, status (draft/sent/paid/overdue)
- Payment status tracking with manual mark-as-paid (no payment gateway integration required for v1)
- Recurring billing setup for retainer clients (generates draft invoices on schedule)
- Per-client and per-project profitability view: revenue vs. hours/cost logged
- Basic expense tracking (optional, tied to a project or general overhead)

### 5. Proposals & Contracts
- Proposal templates (reusable), versioning, status (draft/sent/viewed/accepted/rejected)
- Contract/SOW file storage per client (via Supabase Storage)
- Manual status tracking for signatures (no e-signature API integration required for v1 — track status manually until budget allows an integration)

### 6. Documents
- Central file repository per client (contracts, assets, credentials if applicable)
- Version history where feasible (Supabase Storage versioning or manual re-upload with timestamp)
- Access restricted by RLS to Admin and assigned Account Manager for sensitive documents

### 7. Dashboard & Reporting
- Pipeline value (sum of Lead/Negotiation stage projects)
- Active clients and active projects count
- Overdue invoices list
- Upcoming deadlines across all projects
- Team workload view (tasks per team member)
- Revenue trends over time
- Per-client profitability summary

## Data Model Guidance (high level — refine into full schema separately)
Core entities and their key relationships:
- `users` (Supabase Auth) → `profiles` (role, name, extended info)
- `clients` → has many `contacts`, `projects`, `activity_log_entries`, `documents`
- `projects` → belongs to `client`, has many `tasks`, `milestones`, assigned `team_members`
- `tasks` → belongs to `project`, assigned to `user`, has many `comments`
- `invoices` → belongs to `client`, optionally linked to `project`/`milestone`, has many `line_items`
- `proposals` → belongs to `client`, has `status`, linked `document`
- `documents` → belongs to `client` (and optionally `project`), stored via Supabase Storage
- `activity_log_entries` → belongs to `client`, logged by `user`, timestamped

## Security Requirements (non-negotiable)
1. Row Level Security must be enabled on every table before it holds real data.
2. Write explicit RLS policies per role for SELECT/INSERT/UPDATE/DELETE on every table — do not rely on default-open tables.
3. The Supabase **service role key** must never be included in frontend code or the Next.js bundle. It is only used server-side (e.g., in a Supabase Edge Function), and only if absolutely necessary.
4. Disable public self-signup in Supabase Auth settings; team accounts are created via invite.
5. Before launch, manually test each role by logging in as a lower-privilege user and confirming denied access at the database level, not just hidden UI elements.

## Non-Functional Requirements
- Full **dark mode and light mode** support, user-toggleable, following the attached design system document
- Responsive layout — usable on desktop (primary) and tablet; mobile-friendly is a bonus, not required for v1
- All hosting and services must remain within free tiers (Cloudflare Pages, Supabase free tier)
- No client-facing views, login, or communication features anywhere in the app

## Recommended Build Order
1. Auth, roles, and RLS foundation (Supabase project setup, profiles table, role-based policies)
2. Client & Contact Management
3. Project Management + Kanban + Tasks
4. Internal Team Collaboration (comments, @mentions, notifications)
5. Documents & Client Activity Timeline
6. Proposals, Contracts & Invoicing
7. Dashboard & Reporting

Build and test each module's RLS policies before moving to the next — do not defer security to the end.
