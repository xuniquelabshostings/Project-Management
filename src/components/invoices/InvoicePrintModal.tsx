"use client";

import React, { useRef } from "react";
import {
  Printer,
  Mail,
  X,
  FileDown,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Invoice, InvoiceLineItem } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/providers/BrandingProvider";

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoicePrintModal({ isOpen, onClose, invoice }: InvoicePrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { branding } = useBranding();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    // Clean up any previously attached print iframe
    const existingFrame = document.getElementById("invoice-print-frame");
    if (existingFrame) {
      existingFrame.remove();
    }

    // Create an isolated hidden iframe with desktop dimensions so media queries don't collapse
    const iframe = document.createElement("iframe");
    iframe.id = "invoice-print-frame";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "1024px";
    iframe.style.height = "1400px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and style rules from current page
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((node) => node.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice - ${invoice.invoice_number}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            .invoice-print-root {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              border: none !important;
              box-shadow: none !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
          </style>
        </head>
        <body>
          <div class="invoice-print-root">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give iframe time to apply styles and ensure all images are rendered
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 1500);
      }
    }, 300);
  };

  // Ensure line items are present or fallback intelligently
  const lineItems: InvoiceLineItem[] =
    invoice.line_items && invoice.line_items.length > 0
      ? invoice.line_items
      : [
          {
            id: "default-item",
            invoice_id: invoice.id,
            description:
              invoice.project?.name
                ? `Professional Services - ${invoice.project.name} (${invoice.notes || "Milestone Deliverable"})`
                : invoice.notes || "Professional Development & Consulting Services",
            quantity: 1,
            unit_price: Number(invoice.total_amount) || 0,
            line_total: Number(invoice.total_amount) || 0,
          },
        ];

  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.line_total) || 0), 0);
  const total = Number(invoice.total_amount) || subtotal;
  const clientEmail =
    invoice.client?.contacts?.[0]?.email ||
    (invoice.client as any)?.email ||
    "client@example.com";
  const clientName = invoice.client?.company_name || "Valued Client";

  const emailSubject = encodeURIComponent(
    `Invoice ${invoice.invoice_number} from ${branding.companyName}`
  );
  const emailBody = encodeURIComponent(
    `Dear ${clientName},\n\nPlease find attached details for invoice ${invoice.invoice_number} for total amount ${formatINR(total)} due on ${new Date(invoice.due_date).toLocaleDateString()}.\n\nThank you for your business!\n\nBest regards,\n${branding.companyName} Team`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-semibold text-foreground">
                Invoice {invoice.invoice_number}
              </h2>
              <p className="text-xs text-muted">
                Client: {clientName} &bull; {formatINR(total)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${clientEmail}?subject=${emailSubject}&body=${emailBody}`}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5 text-muted" />
              Email Client
            </a>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Tip Banner (Hidden during print) */}
        <div className="no-print px-6 py-2 bg-info-bg/40 border-b border-info/20 text-xs text-info flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Tip:</strong> In the print preview window, choose <strong>&quot;Save as PDF&quot;</strong> as your destination to download a client-ready PDF file.
            </span>
          </span>
          <span className="text-[11px] opacity-80">A4 Portrait &bull; Clean Ink-Saving Layout</span>
        </div>

        {/* Scrollable Preview Wrapper */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-muted/5 flex justify-center">
          {/* Printable Invoice Card */}
          <div
            id="printable-invoice"
            ref={printRef}
            className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Header: Company Info + Invoice Details */}
            <div className="flex flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={branding.companyName}
                      className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-white p-1 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-serif shrink-0">
                      {branding.companyName.charAt(0) || "X"}
                    </div>
                  )}
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                      {branding.companyName}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      {branding.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500 space-y-0.5">
                  <p>{branding.addressLine1}</p>
                  {branding.addressLine2 && <p>{branding.addressLine2}</p>}
                  <p>{branding.email} &bull; {branding.phone}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block px-3 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 tracking-wider uppercase mb-2">
                  INVOICE
                </div>
                <div className="font-mono text-xl font-bold text-slate-900">
                  {invoice.invoice_number}
                </div>

                <div className="mt-3 text-xs space-y-1">
                  <div className="flex justify-end gap-3">
                    <span className="text-slate-500">Issue Date:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(invoice.created_at || Date.now()).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(invoice.due_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 items-center pt-1">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        invoice.status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : invoice.status === "overdue"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To & Project Details */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-100 text-xs">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Billed To
                </p>
                <p className="text-sm font-bold text-slate-900">{clientName}</p>
                {invoice.client?.industry && (
                  <p className="text-slate-500">{invoice.client.industry}</p>
                )}
                <p className="text-slate-600 mt-1">{clientEmail}</p>
                {invoice.client?.website && (
                  <p className="text-slate-400">{invoice.client.website}</p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Project Reference
                </p>
                {invoice.project ? (
                  <>
                    <p className="text-sm font-bold text-slate-900">{invoice.project.name}</p>
                    {invoice.project.description && (
                      <p className="text-slate-500 line-clamp-2 mt-0.5">
                        {invoice.project.description}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">General Consulting / Retainer Services</p>
                )}
                {invoice.is_recurring && (
                  <p className="text-slate-500 mt-1 capitalize font-medium">
                    Schedule: Recurring {invoice.recurrence_interval} retainer
                  </p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6 border-b border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 pr-4">#</th>
                    <th className="py-2.5 pr-4 w-1/2">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 pl-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 pr-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatINR(item.unit_price)}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono font-semibold text-slate-900">
                        {formatINR(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Calculations */}
            <div className="py-6 flex flex-row justify-between items-start gap-6 border-b border-slate-100">
              <div className="max-w-xs text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Payment Notes:</p>
                <p className="text-slate-600 italic">
                  {invoice.notes || "Thank you for partnering with XUnique Labs. Prompt payment is appreciated."}
                </p>
              </div>

              <div className="w-64 text-xs space-y-2 shrink-0">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">{formatINR(total)}</span>
                </div>
                {invoice.status === "paid" ? (
                  <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">{formatINR(total)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs font-semibold text-rose-700 pt-1">
                    <span>Balance Due:</span>
                    <span className="font-mono">{formatINR(total)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Terms */}
            <div className="pt-6 flex flex-row justify-between items-end gap-4 text-[11px] text-slate-400 border-t border-slate-100">
              <div>
                <p className="font-medium text-slate-600">Terms &amp; Conditions</p>
                <p>1. Payment is due within 15 days of invoice issue date.</p>
                <p>2. Please quote invoice number in all communications.</p>
              </div>

              <div className="text-right shrink-0">
                <div className="h-10 border-b border-dashed border-slate-300 w-40 ml-auto mb-1"></div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Authorized Signatory
                </p>
                <p className="text-[10px] text-slate-400">{branding.companyName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer buttons */}
        <div className="no-print flex items-center justify-between px-6 py-3 border-t border-border bg-surface-elevated">
          <p className="text-xs text-muted">
            Clicking &quot;Print / Save as PDF&quot; opens system print dialogue.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
