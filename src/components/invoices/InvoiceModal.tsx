"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice, InvoiceStatus, Client, Project, Milestone } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";
import { isValidUuid, MOCK_PROJECTS } from "@/lib/mock-data";

interface LineItemDraft {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  invoiceToEdit?: Invoice | null;
}

export function InvoiceModal({ isOpen, onClose, onSaved, invoiceToEdit }: InvoiceModalProps) {
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<"monthly" | "quarterly">("monthly");
  const [notes, setNotes] = useState("");

  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { description: "Sprint Milestone Delivery", quantity: 1, unit_price: 5000 },
  ]);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("id, company_name")
        .order("company_name", { ascending: true });
      if (data) setClients(data as Client[]);
    }
    if (isOpen) loadClients();
  }, [isOpen]);

  useEffect(() => {
    async function loadProjects() {
      if (!clientId) {
        setProjects([]);
        setMilestones([]);
        return;
      }
      if (!isValidUuid(clientId)) {
        const localProjs = MOCK_PROJECTS.filter((p) => p.client_id === clientId);
        setProjects(localProjs);
        return;
      }
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", clientId);
      if (data && data.length > 0) {
        setProjects(data as Project[]);
      } else {
        const localProjs = MOCK_PROJECTS.filter((p) => p.client_id === clientId);
        setProjects(localProjs);
      }
    }
    loadProjects();
  }, [clientId]);

  useEffect(() => {
    async function loadMilestones() {
      if (!projectId) {
        setMilestones([]);
        return;
      }
      const { data } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId);
      if (data) setMilestones(data as Milestone[]);
    }
    loadMilestones();
  }, [projectId]);

  useEffect(() => {
    if (invoiceToEdit) {
      setClientId(invoiceToEdit.client_id);
      setProjectId(invoiceToEdit.project_id || "");
      setMilestoneId(invoiceToEdit.milestone_id || "");
      setInvoiceNumber(invoiceToEdit.invoice_number);
      setStatus(invoiceToEdit.status);
      setDueDate(invoiceToEdit.due_date);
      setIsRecurring(invoiceToEdit.is_recurring);
      setRecurrenceInterval(invoiceToEdit.recurrence_interval || "monthly");
      setNotes(invoiceToEdit.notes || "");

      if (invoiceToEdit.line_items && invoiceToEdit.line_items.length > 0) {
        setLineItems(
          invoiceToEdit.line_items.map((li) => ({
            id: li.id,
            description: li.description,
            quantity: li.quantity,
            unit_price: Number(li.unit_price),
          }))
        );
      }
    } else {
      setClientId("");
      setProjectId("");
      setMilestoneId("");
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus("draft");
      const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      setDueDate(in30Days);
      setIsRecurring(false);
      setRecurrenceInterval("monthly");
      setNotes("");
      setLineItems([{ description: "Sprint Deliverables", quantity: 1, unit_price: 3500 }]);
    }
    setErrorMsg(null);
  }, [invoiceToEdit, isOpen]);

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItemDraft,
    val: any
  ) => {
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const grandTotal = lineItems.reduce(
    (acc, li) => acc + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg("Please select a client.");
      return;
    }
    if (!invoiceNumber.trim()) {
      setErrorMsg("Invoice number is required.");
      return;
    }
    if (!dueDate) {
      setErrorMsg("Due date is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const invoicePayload = {
        client_id: clientId,
        project_id: projectId || null,
        milestone_id: milestoneId || null,
        invoice_number: invoiceNumber.trim(),
        status,
        total_amount: grandTotal,
        due_date: dueDate,
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let currentInvoiceId = invoiceToEdit?.id;

      if (invoiceToEdit) {
        const { error: invErr } = await supabase
          .from("invoices")
          .update(invoicePayload)
          .eq("id", invoiceToEdit.id);
        if (invErr) throw invErr;

        // Delete existing items to replace
        await supabase
          .from("invoice_line_items")
          .delete()
          .eq("invoice_id", invoiceToEdit.id);
      } else {
        const { data: newInv, error: invErr } = await supabase
          .from("invoices")
          .insert({
            ...invoicePayload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (invErr) throw invErr;
        currentInvoiceId = newInv.id;
      }

      // Insert line items
      const itemsToInsert = lineItems.map((li) => ({
        invoice_id: currentInvoiceId!,
        description: li.description.trim() || "Item",
        quantity: Number(li.quantity) || 1,
        unit_price: Number(li.unit_price) || 0,
        line_total: (Number(li.quantity) || 1) * (Number(li.unit_price) || 0),
      }));

      const { error: liErr } = await supabase
        .from("invoice_line_items")
        .insert(itemsToInsert);

      if (liErr) throw liErr;

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? "Edit Invoice" : "Create New Invoice"}
      description="Issue milestone billings, retainer fees, and line-item statements."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Client Account *
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
                setMilestoneId("");
              }}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Invoice Number *
            </label>
            <Input
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Linked Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setMilestoneId("");
              }}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">None / General</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Trigger Milestone
            </label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Due Date *
            </label>
            <Input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="recurring-invoice"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="recurring-invoice" className="text-xs text-foreground cursor-pointer">
              Recurring Retainer Billing
            </label>
            {isRecurring && (
              <select
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value as any)}
                className="rounded border border-border bg-surface px-2 py-1 text-xs"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            )}
          </div>
        </div>

        {/* Dynamic Line Items Table */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Invoice Line Items
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddLineItem}
              className="text-xs h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Line
            </Button>
          </div>

          <div className="space-y-2">
            {lineItems.map((li, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Input
                  required
                  placeholder="Deliverable description"
                  value={li.description}
                  onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                  className="flex-1 text-xs"
                />
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  value={li.quantity}
                  onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                  className="w-16 text-xs text-center font-mono"
                />
                <Input
                  type="number"
                  min="0"
                  step="50"
                  required
                  placeholder="Rate"
                  value={li.unit_price}
                  onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                  className="w-24 text-xs font-mono"
                />
                <span className="w-20 text-right font-mono font-medium text-foreground">
                  ${((Number(li.quantity) || 1) * (Number(li.unit_price) || 0)).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveLineItem(idx)}
                  disabled={lineItems.length === 1}
                  className="p-1 text-muted hover:text-danger disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-border/40 mt-3 text-sm">
            <div className="text-right">
              <span className="text-xs text-muted mr-3">Total Amount:</span>
              <span className="font-serif font-bold text-base text-foreground font-mono">
                ${grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {invoiceToEdit ? "Save Invoice" : "Generate Invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
