"use client";

import React, { useState, useEffect } from "react";
import {
  FileSignature,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  RotateCw,
} from "lucide-react";
import { Agreement, AgreementStatus, Client } from "@/types/database.types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn, formatINR } from "@/lib/utils";
import { getNextAgreementNumber, generateUUID } from "@/lib/mock-data";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agreement: Agreement) => void;
  clients: Client[];
  initialData?: Agreement | null;
  existingAgreements?: Agreement[];
}

const SCOPE_PRESETS = [
  {
    label: "Full-Stack Web App",
    scope:
      "Full-stack React & Next.js web application, responsive user dashboard, relational database architecture (Postgres / Supabase) with Row Level Security, role-based authentication, and RESTful API endpoints.",
  },
  {
    label: "Mobile App (iOS & Android)",
    scope:
      "Cross-platform mobile application built with React Native / Flutter, offline data caching, push notifications integration, secure biometric authentication, and backend API synchronization.",
  },
  {
    label: "SaaS MVP Engineering",
    scope:
      "End-to-end Minimum Viable Product (MVP) development including user onboarding, core business workflow automation, payment gateway checkout integration, admin analytics panel, and cloud deployment on Vercel/AWS.",
  },
  {
    label: "Custom API & Microservices",
    scope:
      "Design, engineering, and deployment of resilient backend REST / GraphQL microservices, database schema optimization, automated webhook listeners, third-party API orchestrations, and API documentation.",
  },
];

const PAYMENT_PRESET_OPTIONS = [
  {
    shortLabel: "50% / 50% Milestone",
    value:
      "50% advance retainer prior to development kickoff, 50% upon final milestone inspection and code delivery.",
  },
  {
    shortLabel: "40% / 30% / 30%",
    value:
      "40% advance retainer upon signing, 30% upon Milestone 1 core deliverables, 30% upon final production deployment.",
  },
  {
    shortLabel: "100% Advance",
    value: "100% advance project retainer prior to sprint commencement.",
  },
  {
    shortLabel: "Monthly Retainer",
    value: "Monthly recurring engineering retainer payable on the 1st of each calendar month in advance.",
  },
];

export function AgreementModal({
  isOpen,
  onClose,
  onSave,
  clients,
  initialData,
  existingAgreements,
}: AgreementModalProps) {
  const [clientId, setClientId] = useState("");
  const [agreementNumber, setAgreementNumber] = useState("");
  const [projectName, setProjectName] = useState("");
  const [title, setTitle] = useState("Master Software Development & Services Agreement");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [totalFee, setTotalFee] = useState<number>(150000);
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_PRESET_OPTIONS[0].value);
  const [scopeOfWork, setScopeOfWork] = useState(SCOPE_PRESETS[0].scope);
  const [warrantyDays, setWarrantyDays] = useState<number>(14);
  const [specialTerms, setSpecialTerms] = useState("");
  const [status, setStatus] = useState<AgreementStatus>("draft");
  const [showSafeguards, setShowSafeguards] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.client_id || "");
      setAgreementNumber(initialData.agreement_number || "");
      setProjectName(initialData.project_name || "");
      setTitle(initialData.title || "Master Software Development & Services Agreement");
      setEffectiveDate(initialData.effective_date || "");
      setCompletionDate(initialData.completion_date || "");
      setTotalFee(initialData.total_fee || 0);
      setPaymentTerms(initialData.payment_terms || PAYMENT_PRESET_OPTIONS[0].value);
      setScopeOfWork(initialData.scope_of_work || "");
      setWarrantyDays(initialData.warranty_days || 14);
      setSpecialTerms(initialData.special_terms || "");
      setStatus(initialData.status || "draft");
    } else {
      setClientId(clients[0]?.id || "");
      setAgreementNumber(getNextAgreementNumber(existingAgreements));
      setProjectName("");
      setTitle("Master Software Development & Services Agreement");
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setCompletionDate("");
      setTotalFee(150000);
      setPaymentTerms(PAYMENT_PRESET_OPTIONS[0].value);
      setScopeOfWork(SCOPE_PRESETS[0].scope);
      setWarrantyDays(14);
      setSpecialTerms("");
      setStatus("draft");
    }
    setErrorMsg(null);
  }, [initialData, clients, isOpen, existingAgreements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg("Please select a client for this agreement.");
      return;
    }
    if (!projectName.trim()) {
      setErrorMsg("Please provide a project or deliverable name.");
      return;
    }
    if (!effectiveDate) {
      setErrorMsg("Please choose an effective start date.");
      return;
    }
    if (!scopeOfWork.trim()) {
      setErrorMsg("Please detail the scope of work.");
      return;
    }

    const selectedClientObj = clients.find((c) => c.id === clientId);

    const finalAgreementNumber =
      agreementNumber.trim() ||
      initialData?.agreement_number ||
      getNextAgreementNumber(existingAgreements);

    const savedAgreement: Agreement = {
      id: initialData?.id || generateUUID(),
      agreement_number: finalAgreementNumber,
      client_id: clientId,
      project_name: projectName.trim(),
      title: title.trim(),
      effective_date: effectiveDate,
      completion_date: completionDate || undefined,
      total_fee: Number(totalFee) || 0,
      payment_terms: paymentTerms.trim(),
      scope_of_work: scopeOfWork.trim(),
      warranty_days: Number(warrantyDays) || 14,
      special_terms: specialTerms.trim() || undefined,
      status,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client: selectedClientObj,
    };

    onSave(savedAgreement);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Software Agreement" : "Generate Developer Agreement"}
      description="Create a client-ready master software agreement with standard agency terms and statutory non-GST & legal exemption clauses"
      className="max-w-3xl w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-md text-xs bg-danger-bg text-danger border border-danger/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Client & Project Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Client Name (Second Party) *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full min-h-[38px] rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name || client.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Project / Deliverable Name *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Next.js SaaS Web App & API"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Agreement Ref #, Title & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          <div className="sm:col-span-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-foreground">
                Agreement Ref # *
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                  Auto
                </span>
                <button
                  type="button"
                  onClick={() => setAgreementNumber(getNextAgreementNumber(existingAgreements))}
                  className="text-muted hover:text-accent p-0.5 rounded transition-colors"
                  title="Generate next sequential number"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
            </div>
            <Input
              type="text"
              required
              value={agreementNumber}
              onChange={(e) => setAgreementNumber(e.target.value)}
              className="text-sm font-mono"
              placeholder="e.g. AGR-2026-003"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Agreement Title
            </label>
            <Input
              type="text"
              required
              placeholder="Master Software Development & Services Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Agreement Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AgreementStatus)}
              className="w-full min-h-[38px] rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent to Client</option>
              <option value="signed">Signed</option>
              <option value="active">Active (In Development)</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Dates & Commercials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Effective Start Date *
            </label>
            <Input
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target Delivery Date
            </label>
            <Input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Total Agreed Fee (₹ INR) *
            </label>
            <Input
              type="number"
              required
              min={0}
              step={1000}
              value={totalFee}
              onChange={(e) => setTotalFee(Number(e.target.value))}
              className="text-sm font-mono"
            />
          </div>
        </div>

        {/* Scope of Work Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <label className="block text-xs font-medium text-foreground">
              Scope of Work &amp; Deliverables *
            </label>
            <span className="text-[11px] text-muted">Click a preset to auto-fill:</span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SCOPE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setScopeOfWork(p.scope)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-accent/10 hover:text-accent border border-border transition-colors font-medium touch-manipulation"
              >
                + {p.label}
              </button>
            ))}
          </div>

          <Textarea
            required
            rows={3}
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            placeholder="Detailed description of features, architectures, and deliverables..."
            className="text-xs resize-y"
          />
        </div>

        {/* Payment Terms */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <label className="block text-xs font-medium text-foreground">
              Milestone &amp; Payment Schedule *
            </label>
            <span className="text-[11px] text-muted">Quick presets:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {PAYMENT_PRESET_OPTIONS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPaymentTerms(p.value)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md border transition-colors font-medium touch-manipulation",
                  paymentTerms === p.value
                    ? "bg-accent/10 text-accent border-accent/40 font-semibold"
                    : "bg-surface-elevated hover:bg-accent/10 hover:text-accent border-border"
                )}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>

          <Input
            type="text"
            required
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Warranty & Special Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Testing &amp; Bug Warranty (Days)
            </label>
            <Input
              type="number"
              min={0}
              max={90}
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(Number(e.target.value))}
              placeholder="14"
              className="text-sm font-mono"
            />
            <p className="text-[10px] text-muted mt-1">
              Deliverables deemed 100% accepted after this window.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Special Provisions (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Cloud hosting and external infrastructure costs to be billed directly to Client"
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Legal Safeguard Info Accordion */}
        <div className="rounded-lg border border-border/80 bg-surface-elevated/60 text-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSafeguards(!showSafeguards)}
            className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-surface-elevated transition-colors"
          >
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Developer Safeguards Included (GST, Liability, Jurisdiction)</span>
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted transition-transform duration-200 shrink-0 ml-2",
                showSafeguards && "rotate-180"
              )}
            />
          </button>
          {showSafeguards && (
            <div className="px-3.5 pb-3.5 pt-1 border-t border-border/40 text-muted space-y-1.5">
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>
                  <strong>Statutory GST Non-Applicability:</strong> Unregistered micro-enterprise under Section 22 CGST Act 2017 (no GST charged or applicable).
                </li>
                <li>
                  <strong>Total Liability Exemption:</strong> Consequential damages excluded for downtime, data loss, security breaches, or regulatory fines.
                </li>
                <li>
                  <strong>Liability Cap:</strong> Cumulative liability strictly capped at fees actually received or ₹1,000.
                </li>
                <li>
                  <strong>Third-Party Exemption:</strong> Zero developer liability for cloud provider outages or API deprecations.
                </li>
                <li>
                  <strong>Exclusive Jurisdiction:</strong> Competent courts located in Siddharth Nagar, UP, India.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Sticky Actions Bar */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-3 sm:p-4 bg-surface/95 backdrop-blur-xs border-t border-border mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 z-10">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
            <span>Agreed Fee:</span>
            <span className="font-mono font-bold text-foreground">
              {formatINR(Number(totalFee) || 0)}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-initial text-xs py-2 sm:py-1.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial text-xs font-medium py-2 sm:py-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              {initialData ? "Save Changes" : "Generate Agreement"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
