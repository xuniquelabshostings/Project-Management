"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  ArrowUpRight,
  Shield,
  Send,
  Building2,
  Printer,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGate } from "@/components/auth/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { InvoiceModal } from "@/components/invoices/InvoiceModal";
import { InvoicePrintModal } from "@/components/invoices/InvoicePrintModal";
import { Invoice, InvoiceStatus } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_INVOICES, getLocalInvoices, saveLocalInvoice, isValidUuid } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export default function InvoicesPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("*, client:clients(*), project:projects(*), line_items:invoice_line_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const localList = getLocalInvoices();
      if (data && data.length > 0) {
        const customOnly = localList.filter((li) => !data.some((d) => d.id === li.id));
        setInvoices([...customOnly, ...(data as Invoice[])]);
      } else {
        setInvoices(localList);
      }
    } catch (err: any) {
      console.warn("Failed to load invoices, using fallback:", err.message);
      setInvoices(getLocalInvoices());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const clientName = inv.client?.client_name || inv.client?.company_name;
      const matchesSearch =
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clientName && clientName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Financial summary metrics
  const { totalPaid, totalOutstanding, totalOverdue } = useMemo(() => {
    let paid = 0;
    let outstanding = 0;
    let overdue = 0;

    for (const inv of invoices) {
      const amt = Number(inv.total_amount) || 0;
      if (inv.status === "paid") paid += amt;
      if (inv.status === "sent") outstanding += amt;
      if (inv.status === "overdue") {
        overdue += amt;
        outstanding += amt;
      }
    }

    return { totalPaid: paid, totalOutstanding: outstanding, totalOverdue: overdue };
  }, [invoices]);

  const handleUpdateStatus = async (invoiceId: string, newStatus: InvoiceStatus) => {
    // 1. Optimistic update in UI and local storage
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id === invoiceId) {
          const updated = { ...i, status: newStatus, updated_at: new Date().toISOString() };
          saveLocalInvoice(updated);
          return updated;
        }
        return i;
      })
    );

    // 2. Sync to Supabase if valid UUID
    if (isValidUuid(invoiceId)) {
      try {
        const { error } = await supabase
          .from("invoices")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", invoiceId);
        if (error) console.warn("Notice updating status in Supabase:", error.message);
      } catch (err: any) {
        console.warn("Failed to sync invoice status update to Supabase:", err.message);
      }
    }
  };

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsCreateModalOpen(true);
  };

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
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Financial data and client invoicing are restricted to Administrators and
              Account Managers. Developers do not have access to contracts or billing.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                Financials & Invoicing
              </h1>
              <p className="text-sm text-muted mt-1">
                Milestone billings, retainer payments, and client receivables
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingInvoice(null);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Invoice
            </Button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Total Paid Revenue
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                    {formatINR(totalPaid)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-md bg-success-bg text-success flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Outstanding Receivables
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                    {formatINR(totalOutstanding)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-md bg-warning-bg text-warning flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Overdue Invoices
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                    {formatINR(totalOverdue)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-md bg-danger-bg text-danger flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Search invoice number, client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Invoices Table */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading financial records...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-lg bg-surface">
              <Receipt className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No invoices found</p>
              <p className="text-xs text-muted mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try resetting your search or status filter."
                  : "Generate your first project or retainer invoice."}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEditingInvoice(null);
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Invoice
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client & Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <div className="font-mono text-xs font-semibold text-foreground">
                            {inv.invoice_number}
                          </div>
                          {inv.is_recurring && (
                            <Badge variant="outline" className="text-[9px] mt-0.5 capitalize">
                              Recurring ({inv.recurrence_interval})
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium text-foreground">
                            {inv.client?.client_name || inv.client?.company_name || "Client"}
                          </div>
                          {inv.project && (
                            <div className="text-xs text-muted flex items-center gap-1">
                              <span>Project: {inv.project.name}</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <InvoiceStatusBadge status={inv.status} />
                        </TableCell>

                        <TableCell className="text-xs font-mono text-muted">
                          {new Date(inv.due_date).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                          {formatINR(inv.total_amount)}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {inv.status !== "paid" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUpdateStatus(inv.id, "paid")}
                                className="text-[11px] h-7 px-2 text-success hover:border-success/40"
                                title="Mark as Paid"
                              >
                                Mark Paid
                              </Button>
                            )}

                            {inv.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(inv.id, "sent")}
                                className="text-[11px] h-7 px-2"
                                title="Mark as Sent"
                              >
                                Mark Sent
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              className="text-[11px] h-7 px-2 flex items-center gap-1 hover:border-foreground/40"
                              title="Print / Export PDF for client"
                            >
                              <Printer className="w-3 h-3 text-muted" />
                              <span>Print / PDF</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(inv)}
                              className="text-[11px] h-7 px-2 text-muted hover:text-foreground"
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <InvoiceModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSaved={() => fetchInvoices()}
            invoiceToEdit={editingInvoice}
            existingInvoices={invoices}
          />

          <InvoicePrintModal
            isOpen={!!selectedInvoiceForPrint}
            onClose={() => setSelectedInvoiceForPrint(null)}
            invoice={selectedInvoiceForPrint}
          />
        </div>
      </RoleGate>
    </DashboardLayout>
  );
}
