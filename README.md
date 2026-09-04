# Xunique Labs &bull; Internal Client Management Portal

A multi-user, internal-only client and project management application built for **Xunique Labs** software agency. Replaces WhatsApp (internal team coordination), Excel (client/financial tracking), and Trello (Kanban task management) with a single unified system.

> **Zero Client-Facing Access**: Clients never log into or communicate through this app. All communication happens externally (WhatsApp, email, calls) and is logged into the activity timeline.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router, Static Export `output: 'export'`)
- **Hosting**: Cloudflare Pages (Free Tier)
- **Backend / Database**: Supabase (Free Tier) — PostgreSQL with strict Row Level Security (RLS), Supabase Auth, Supabase Storage
- **Design System**: Claude-inspired warm palette (Light & Dark mode, Lora serif headings, Inter body, JetBrains Mono, terracotta accents)
- **State Management**: TanStack Query + React Context
- **Board Drag & Drop**: `@dnd-kit`

---

## 🎨 Design System

Follows the understated, warm Claude aesthetic:
- **Light Mode**: Cream/off-white background (`#FAF9F5`), warm card surfaces, soft 1px borders (`#E8E4DD`), charcoal text (`#1F1B16`).
- **Dark Mode**: Dark charcoal background (`#1A1815`), warm surface cards (`#232019`), soft off-white text (`#F2EFE9`).
- **Accent**: Warm terracotta / burnt orange (`#CC785C` / `#D4896E`).
- **Semantic Badges**: Muted sage green (Active/Paid), muted amber (Pending/On Hold), muted brick red (Overdue/Urgent), muted blue-gray (Lead/Draft).

---

## 🔐 User Roles & RLS Security

Access control is enforced directly by PostgreSQL policies at the database level:

| Role | Permissions |
|---|---|
| **Admin** | Full access to everything: all clients, all projects, all invoices/financials, team user management. |
| **Account Manager** | Access to clients & projects assigned to them. Invoices and proposals for their assigned clients only. Cannot view other AMs' clients. |
| **Developer** | Scoped strictly to assigned projects, tasks, and task comments. Zero access to client financials, invoices, contracts, or unassigned clients. |

---

## 🚀 Setup & Local Development

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run Supabase Migrations
In your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**, run the migration scripts in numerical order:
1. `supabase/migrations/001_profiles_and_roles.sql` (Auth triggers, profiles, RLS helper functions)
2. `supabase/migrations/002_clients_and_contacts.sql` (Clients, contacts, activity log)
3. `supabase/migrations/003_projects_and_tasks.sql` (Projects, Kanban tasks, milestones)
4. `supabase/migrations/004_collaboration.sql` (Comments, @mentions, notifications)
5. `supabase/migrations/005_documents.sql` (Documents metadata and access policies)
6. `supabase/migrations/006_invoices_and_proposals.sql` (Invoices, line items, proposals)
7. *(Optional)* `supabase/seed.sql` for sample clients and projects

### 4. Supabase Auth Configuration
1. Go to **Authentication** -> **Signers / Providers** -> Disable **Allow new users to sign up** (internal invitation only).
2. The very first user invited/created will automatically be assigned the **Admin** role.
3. Subsequent users can be invited and assigned **Account Manager** or **Developer** roles via `/team` or the Supabase Auth dashboard.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Cloudflare Pages Deployment

Because the app is configured for static export (`output: 'export'`), it runs on Cloudflare Pages free tier without any SSR compute cost:

1. Connect your repository to Cloudflare Pages.
2. Build Settings:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
3. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!
