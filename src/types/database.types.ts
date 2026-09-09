export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "account_manager" | "developer";
export type ClientStatus = "lead" | "negotiation" | "active" | "on_hold" | "churned";
export type LeadSource =
  | "referral"
  | "upwork"
  | "linkedin"
  | "inbound"
  | "cold_outreach"
  | "other";
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectMemberRole = "lead" | "contributor" | "reviewer";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected";
export type AgreementStatus = "draft" | "sent" | "signed" | "active" | "completed";
export type ActivityType =
  | "call"
  | "meeting"
  | "email"
  | "whatsapp"
  | "decision"
  | "note"
  | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  theme_preference: "light" | "dark" | "system" | string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_name?: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: ClientStatus;
  lead_source: LeadSource | null;
  tags: string[];
  account_manager_id: string | null;
  created_at: string;
  updated_at: string;
  account_manager?: Profile | null;
  contacts?: Contact[];
  projects?: Project[];
  // Domain & Hosting Lifecycle
  domain_name?: string | null;
  domain_registrar?: string | null;
  domain_registered_at?: string | null;
  domain_renew_at?: string | null;
  domain_price?: number | null;
  hosting_provider?: string | null;
  hosting_plan?: string | null;
  hosting_activated_at?: string | null;
  hosting_renew_at?: string | null;
  hosting_price?: number | null;
  renewal_alert_days?: number | null;
}

export function getClientName(client?: Partial<Client> | null): string {
  if (!client) return "";
  return client.client_name || client.company_name || "";
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  address?: string | null;
  preferred_channel: "whatsapp" | "email" | "phone" | "other" | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  tech_stack: string[];
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: ProjectStatus;
  kanban_columns: string[];
  created_at: string;
  updated_at: string;
  client?: Client;
  // Domain & Infrastructure
  domain_name?: string | null;
  domain_registrar?: string | null;
  domain_registered_at?: string | null;
  domain_renew_at?: string | null;
  domain_price?: number | null;
  hosting_provider?: string | null;
  hosting_plan?: string | null;
  hosting_activated_at?: string | null;
  hosting_renew_at?: string | null;
  hosting_price?: number | null;
  renewal_alert_days?: number | null;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  project_role: ProjectMemberRole;
  created_at: string;
  user?: Profile;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  kanban_column: string;
  column_order: number;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  author_id: string;
  project_id: string | null;
  task_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ActivityLogEntry {
  id: string;
  client_id: string;
  logged_by: string;
  type: ActivityType;
  summary: string;
  occurred_at: string;
  created_at: string;
  author?: Profile;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  milestone_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  total_amount: number;
  due_date: string;
  is_recurring: boolean;
  recurrence_interval: "monthly" | "quarterly" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  project?: Project;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Proposal {
  id: string;
  client_id: string;
  title: string;
  content: string;
  version: number;
  status: ProposalStatus;
  template_id: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Document {
  id: string;
  client_id: string;
  project_id: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  version: number;
  uploaded_by: string;
  is_sensitive: boolean;
  created_at: string;
  uploader?: Profile;
}

export interface Agreement {
  id: string;
  agreement_number: string;
  client_id: string;
  project_name: string;
  title: string;
  effective_date: string;
  completion_date?: string;
  total_fee: number;
  payment_terms: string;
  scope_of_work: string;
  warranty_days: number;
  special_terms?: string;
  status: AgreementStatus;
  created_at: string;
  updated_at?: string;
  client?: Client | null;
}

export type BlogStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  author_name: string;
  author_avatar: string | null;
  status: BlogStatus;
  read_time_minutes: number;
  views_count: number;
  featured: boolean;
  created_at: string;
  published_at: string | null;
  updated_at?: string;
}

export interface CaseFile {
  id: string;
  case_code: string;
  title: string;
  client_name?: string | null;
  description: string;
  live_url: string;
  category: string;
  tags: string[];
  figure_type: "grid" | "circle" | "cross" | "wave" | "blueprint" | "custom_svg" | "image";
  custom_svg?: string | null;
  image_url?: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface DevelopmentPlan {
  id: string;
  sheet_code: string;
  name: string;
  price: string;
  original_price?: string | null;
  currency_symbol: string;
  price_period?: string | null;
  delivery_time: string;
  is_popular: boolean;
  popular_badge?: string | null;
  is_custom_quote: boolean;
  features: string[];
  cta_text: string;
  whatsapp_message?: string | null;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: GenericRelationship[];
      };
      clients: {
        Row: Client;
        Insert: Partial<Client> & { company_name: string };
        Update: Partial<Client>;
        Relationships: GenericRelationship[];
      };
      contacts: {
        Row: Contact;
        Insert: Partial<Contact> & { client_id: string; name: string };
        Update: Partial<Contact>;
        Relationships: GenericRelationship[];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & { client_id: string; name: string };
        Update: Partial<Project>;
        Relationships: GenericRelationship[];
      };
      project_members: {
        Row: ProjectMember;
        Insert: Partial<ProjectMember> & { project_id: string; user_id: string };
        Update: Partial<ProjectMember>;
        Relationships: GenericRelationship[];
      };
      milestones: {
        Row: Milestone;
        Insert: Partial<Milestone> & { project_id: string; title: string };
        Update: Partial<Milestone>;
        Relationships: GenericRelationship[];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> & { project_id: string; title: string };
        Update: Partial<Task>;
        Relationships: GenericRelationship[];
      };
      task_assignments: {
        Row: TaskAssignment;
        Insert: Partial<TaskAssignment> & { task_id: string; user_id: string };
        Update: Partial<TaskAssignment>;
        Relationships: GenericRelationship[];
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & { author_id: string; body: string };
        Update: Partial<Comment>;
        Relationships: GenericRelationship[];
      };
      activity_log: {
        Row: ActivityLogEntry;
        Insert: Partial<ActivityLogEntry> & { client_id: string; logged_by: string; summary: string };
        Update: Partial<ActivityLogEntry>;
        Relationships: GenericRelationship[];
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice> & { client_id: string; invoice_number: string };
        Update: Partial<Invoice>;
        Relationships: GenericRelationship[];
      };
      invoice_line_items: {
        Row: InvoiceLineItem;
        Insert: Partial<InvoiceLineItem> & { invoice_id: string; description: string };
        Update: Partial<InvoiceLineItem>;
        Relationships: GenericRelationship[];
      };
      proposals: {
        Row: Proposal;
        Insert: Partial<Proposal> & { client_id: string; title: string; content: string };
        Update: Partial<Proposal>;
        Relationships: GenericRelationship[];
      };
      documents: {
        Row: Document;
        Insert: Partial<Document> & { client_id: string; file_name: string; storage_path: string; uploaded_by: string };
        Update: Partial<Document>;
        Relationships: GenericRelationship[];
      };
      notifications: {
        Row: AppNotification;
        Insert: Partial<AppNotification> & { user_id: string; title: string; message: string };
        Update: Partial<AppNotification>;
        Relationships: GenericRelationship[];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & { title: string; slug: string };
        Update: Partial<BlogPost>;
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_account_manager: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      client_status: ClientStatus;
      lead_source: LeadSource;
      project_status: ProjectStatus;
      project_member_role: ProjectMemberRole;
      task_priority: TaskPriority;
      invoice_status: InvoiceStatus;
      proposal_status: ProposalStatus;
      activity_type: ActivityType;
    };
    CompositeTypes: Record<string, never>;
  };
}
