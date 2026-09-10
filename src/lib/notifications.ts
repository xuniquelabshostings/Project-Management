import { Client, Invoice, Task, AppNotification, getClientName } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";

export type AlertCategory = "all" | "infrastructure" | "invoices" | "tasks" | "general";
export type AlertSeverity = "critical" | "warning" | "info" | "success";

export interface UnifiedAlert {
  id: string;
  category: "infrastructure" | "invoices" | "tasks" | "general";
  severity: AlertSeverity;
  subType?: "domain" | "hosting" | "invoice" | "task" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  client?: Client;
  metadata?: {
    daysLeft?: number;
    amount?: number;
    serviceName?: string;
    dueDate?: string;
    actionLabel?: string;
  };
}

const READ_ALERTS_KEY = "xunique_read_alerts_v1";

export function getLocalReadAlertIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_ALERTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveLocalReadAlertId(alertId: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getLocalReadAlertIds();
    set.add(alertId);
    localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function saveLocalReadAllAlertIds(alertIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const set = getLocalReadAlertIds();
    alertIds.forEach((id) => set.add(id));
    localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

/**
 * Gathers and builds all system alerts:
 * 1. Domain Expirations & Renewals
 * 2. Hosting Expirations & Renewals
 * 3. Overdue Invoices
 * 4. Urgent / Overdue Tasks
 * 5. Database Notifications
 */
export async function fetchUnifiedAlerts(userId?: string): Promise<UnifiedAlert[]> {
  const alerts: UnifiedAlert[] = [];
  const readIds = getLocalReadAlertIds();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // -------------------------------------------------------------
  // 1. DOMAIN & HOSTING INFRASTRUCTURE ALERTS
  // -------------------------------------------------------------
  try {
    const { data: dbClients } = await supabase
      .from("clients")
      .select("*, contacts(*)");

    const clients: Client[] = (dbClients as Client[]) || [];

    clients.forEach((c) => {
      const clientName = getClientName(c);
      const alertDays = c.renewal_alert_days || 30;

      // Domain Expiration Check
      if (c.domain_renew_at) {
        const dDate = new Date(c.domain_renew_at);
        dDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= alertDays) {
          const isExpired = diffDays < 0;
          const isUrgent = diffDays <= 7;
          const alertId = `domain-${c.id}-${c.domain_renew_at}`;

          alerts.push({
            id: alertId,
            category: "infrastructure",
            subType: "domain",
            severity: isExpired ? "critical" : isUrgent ? "critical" : "warning",
            title: isExpired
              ? `Domain Expired: ${c.domain_name || "Domain"}`
              : `Domain Renewal Due: ${c.domain_name || "Domain"}`,
            message: isExpired
              ? `${clientName}'s domain expired ${Math.abs(diffDays)} days ago on ${c.domain_renew_at}. Immediate renewal required to prevent DNS loss.`
              : `${clientName}'s domain renews in ${diffDays} day${diffDays === 1 ? "" : "s"} (${c.domain_renew_at}). Registrar: ${c.domain_registrar || "Unspecified"}.${c.domain_price != null ? ` Fee: ${formatINR(c.domain_price)}.` : ""}`,
            timestamp: c.domain_renew_at,
            read: readIds.has(alertId),
            link: `/clients/view?id=${c.id}`,
            client: c,
            metadata: {
              daysLeft: diffDays,
              serviceName: c.domain_name || undefined,
              amount: c.domain_price || undefined,
              actionLabel: "WhatsApp Renewal Alert",
            },
          });
        }
      }

      // Hosting Renewal Check
      if (c.hosting_renew_at) {
        const hDate = new Date(c.hosting_renew_at);
        hDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((hDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= alertDays) {
          const isExpired = diffDays < 0;
          const isUrgent = diffDays <= 7;
          const alertId = `hosting-${c.id}-${c.hosting_renew_at}`;

          alerts.push({
            id: alertId,
            category: "infrastructure",
            subType: "hosting",
            severity: isExpired ? "critical" : isUrgent ? "critical" : "warning",
            title: isExpired
              ? `Hosting Expired: ${c.hosting_provider || "Server"}`
              : `Hosting Renewal Due: ${c.hosting_provider || "Server"}`,
            message: isExpired
              ? `${clientName}'s hosting service expired ${Math.abs(diffDays)} days ago on ${c.hosting_renew_at}. Server suspension risk.`
              : `${clientName}'s hosting (${c.hosting_plan || "Plan"}) renews in ${diffDays} day${diffDays === 1 ? "" : "s"} (${c.hosting_renew_at}).${c.hosting_price != null ? ` Fee: ${formatINR(c.hosting_price)}.` : ""}`,
            timestamp: c.hosting_renew_at,
            read: readIds.has(alertId),
            link: `/clients/view?id=${c.id}`,
            client: c,
            metadata: {
              daysLeft: diffDays,
              serviceName: c.hosting_provider || undefined,
              amount: c.hosting_price || undefined,
              actionLabel: "WhatsApp Renewal Alert",
            },
          });
        }
      }
    });
  } catch (err) {
    console.warn("Could not calculate infrastructure alerts:", err);
  }

  // -------------------------------------------------------------
  // 2. OVERDUE INVOICES ALERTS
  // -------------------------------------------------------------
  try {
    const { data: dbInvoices } = await supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .eq("status", "overdue");

    const invoices: Invoice[] = (dbInvoices as Invoice[]) || [];

    invoices.forEach((inv) => {
      const clientName = inv.client?.client_name || inv.client?.company_name || "Client";
      const dueDate = new Date(inv.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const overdueDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const alertId = `invoice-${inv.id}`;

      alerts.push({
        id: alertId,
        category: "invoices",
        subType: "invoice",
        severity: overdueDays > 14 ? "critical" : "warning",
        title: `Overdue Invoice: ${inv.invoice_number}`,
        message: `${clientName} has an overdue payment of ${formatINR(inv.total_amount)} (due ${inv.due_date}, ${Math.max(1, overdueDays)} days past due).`,
        timestamp: inv.due_date,
        read: readIds.has(alertId),
        link: `/invoices`,
        metadata: {
          daysLeft: -overdueDays,
          amount: inv.total_amount,
          serviceName: inv.invoice_number,
          actionLabel: "Review Invoice",
        },
      });
    });
  } catch (err) {
    console.warn("Could not calculate invoice alerts:", err);
  }

  // -------------------------------------------------------------
  // 3. URGENT & APPROACHING TASKS
  // -------------------------------------------------------------
  try {
    const { data: dbTasks } = await supabase
      .from("tasks")
      .select("*, project:projects(*)")
      .in("priority", ["urgent", "high"])
      .neq("kanban_column", "Done")
      .limit(10);

    const tasks: Task[] = (dbTasks as Task[]) || [];

    tasks.forEach((t) => {
      if (t.due_date) {
        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Alert if due within 3 days or overdue
        if (diffDays <= 3) {
          const isOverdue = diffDays < 0;
          const alertId = `task-${t.id}-${t.due_date}`;

          alerts.push({
            id: alertId,
            category: "tasks",
            subType: "task",
            severity: isOverdue ? "critical" : "warning",
            title: isOverdue ? `Task Overdue: ${t.title}` : `Task Due Soon: ${t.title}`,
            message: isOverdue
              ? `Task in "${t.project?.name || "Project"}" was due on ${t.due_date} (${Math.abs(diffDays)}d overdue). Priority: ${t.priority.toUpperCase()}.`
              : `Task in "${t.project?.name || "Project"}" is due in ${diffDays === 0 ? "TODAY" : `${diffDays} day(s)`} (${t.due_date}).`,
            timestamp: t.due_date,
            read: readIds.has(alertId),
            link: `/tasks`,
            metadata: {
              daysLeft: diffDays,
              serviceName: t.title,
              actionLabel: "View Board",
            },
          });
        }
      }
    });
  } catch (err) {
    console.warn("Could not calculate task alerts:", err);
  }

  // -------------------------------------------------------------
  // 4. DATABASE NOTIFICATIONS (USER MENTIONS, COMMENTS, PROPOSALS)
  // -------------------------------------------------------------
  if (userId) {
    try {
      const { data: userNotes } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (userNotes && userNotes.length > 0) {
        userNotes.forEach((n: AppNotification) => {
          alerts.push({
            id: `db-${n.id}`,
            category: "general",
            subType: "system",
            severity: "info",
            title: n.title,
            message: n.message,
            timestamp: n.created_at,
            read: n.read || readIds.has(`db-${n.id}`),
            link: n.link || undefined,
          });
        });
      }
    } catch (err) {
      console.warn("Could not fetch user database notifications:", err);
    }
  }

  // Sort alerts: unread first, then critical first, then soonest timestamp
  return alerts.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const severityRank: Record<AlertSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      success: 3,
    };
    if (severityRank[a.severity] !== severityRank[b.severity]) {
      return severityRank[a.severity] - severityRank[b.severity];
    }
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
}
