"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  ExternalLink,
  Tag,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check,
  Globe,
  Sliders,
} from "lucide-react";
import { CaseFile } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CaseFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CaseFile> & { title: string }) => Promise<void>;
  editingCase: CaseFile | null;
  totalCount: number;
}

const CATEGORY_PRESETS = [
  "Web Platform",
  "Real Estate",
  "E-Commerce",
  "Healthcare",
  "Education",
  "SaaS / App",
  "FinTech",
  "Corporate",
];

const FIGURE_TYPES = [
  { id: "grid", label: "Blueprint Grid", icon: "📐" },
  { id: "circle", label: "Compass Radii", icon: "🧭" },
  { id: "cross", label: "Care Crosshair", icon: "✚" },
  { id: "wave", label: "Curricula Flow", icon: "📈" },
  { id: "blueprint", label: "Schematic Box", icon: "🏗️" },
  { id: "image", label: "Custom Cover Image", icon: "🖼️" },
] as const;

export function CaseFileModal({
  isOpen,
  onClose,
  onSave,
  editingCase,
  totalCount,
}: CaseFileModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const [title, setTitle] = useState("");
  const [caseCode, setCaseCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("https://");
  const [category, setCategory] = useState("Web Platform");
  const [tagsInput, setTagsInput] = useState("Web Platform, Next.js, API");
  const [figureType, setFigureType] = useState<CaseFile["figure_type"]>("grid");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingCase) {
      setTitle(editingCase.title);
      setCaseCode(editingCase.case_code);
      setClientName(editingCase.client_name || "");
      setDescription(editingCase.description || "");
      setLiveUrl(editingCase.live_url || "https://");
      setCategory(editingCase.category || "Web Platform");
      setTagsInput(editingCase.tags?.join(", ") || "");
      setFigureType(editingCase.figure_type || "grid");
      setImageUrl(editingCase.image_url || "");
      setFeatured(editingCase.featured ?? true);
      setDisplayOrder(editingCase.display_order || 1);
    } else {
      const codeNum = String(totalCount + 1).padStart(2, "0");
      setTitle("");
      setCaseCode(`CASE — PRJ-${codeNum}`);
      setClientName("");
      setDescription("");
      setLiveUrl("https://");
      setCategory("Web Platform");
      setTagsInput("Web Platform, Full-Stack, Responsive");
      setFigureType("grid");
      setImageUrl("");
      setFeatured(true);
      setDisplayOrder(totalCount + 1);
    }
    setErrorMsg("");
    setActiveTab("edit");
  }, [editingCase, totalCount, isOpen]);

  if (!isOpen) return null;

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a project/case title.");
      return;
    }
    if (!liveUrl.trim() || liveUrl === "https://") {
      setErrorMsg("Please provide a valid live website URL.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      await onSave({
        ...(editingCase ? { id: editingCase.id } : {}),
        title: title.trim(),
        case_code: caseCode.trim() || `CASE — PRJ-${String(displayOrder).padStart(2, "0")}`,
        client_name: clientName.trim() || null,
        description: description.trim(),
        live_url: liveUrl.trim(),
        category: category.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ["Web Platform"],
        figure_type: figureType,
        image_url: imageUrl.trim() || null,
        featured,
        display_order: Number(displayOrder) || 1,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save case file.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderBlueprintSvg = () => {
    switch (figureType) {
      case "circle":
        return (
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="120" cy="130" r="70" stroke="#0E2A47" strokeWidth="1" fill="none" />
            <circle cx="280" cy="130" r="45" stroke="#0E2A47" strokeWidth="1" fill="none" />
            <circle cx="200" cy="130" r="110" stroke="#0E2A47" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
          </svg>
        );
      case "cross":
        return (
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M200 50V210M120 130H280" stroke="#0E2A47" strokeWidth="1.2" fill="none" />
            <circle cx="200" cy="130" r="70" stroke="#0E2A47" strokeWidth="0.8" strokeDasharray="4 4" fill="none" />
            <rect x="145" y="75" width="110" height="110" rx="4" stroke="#0E2A47" strokeWidth="0.8" fill="none" />
          </svg>
        );
      case "wave":
        return (
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M40 220V60M40 60L110 120L180 40L250 150L320 90L390 200" stroke="#0E2A47" strokeWidth="1" fill="none" />
            <path d="M40 140H390" stroke="#0E2A47" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
          </svg>
        );
      case "blueprint":
        return (
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="50" y="40" width="300" height="180" stroke="#0E2A47" strokeWidth="1" fill="none" />
            <path d="M50 90H350M150 90V220" stroke="#0E2A47" strokeWidth="0.8" />
            <circle cx="90" cy="65" r="5" fill="#0E2A47" />
            <circle cx="110" cy="65" r="5" fill="#0E2A47" />
            <circle cx="130" cy="65" r="5" fill="#0E2A47" />
          </svg>
        );
      case "image":
        if (imageUrl) {
          return (
            <img
              src={imageUrl}
              alt={title || "Preview"}
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
            />
          );
        }
        // Fallthrough to grid if no image
      case "grid":
      default:
        return (
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="60" y="60" width="280" height="140" stroke="#0E2A47" strokeWidth="1" fill="none" />
            <path d="M60 130H340M160 60V200" stroke="#0E2A47" strokeWidth="0.8" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                {editingCase ? "Edit Case File" : "Create New Case File"}
              </h2>
              <p className="text-xs text-muted font-mono">
                Manage live showcase platforms rendered on the homepage portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-surface border border-border rounded-lg p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === "edit"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === "preview"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Live Card Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs font-sans text-danger flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "edit" ? (
            <form id="case-file-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Project / Platform Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Wasim Health Care, OurHomeIndia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Case Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Blueprint Case Code
                  </label>
                  <Input
                    placeholder="CASE — MED-03"
                    value={caseCode}
                    onChange={(e) => setCaseCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Live URL */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground flex items-center justify-between">
                    <span>Live Website URL *</span>
                    {liveUrl && liveUrl !== "https://" && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-accent hover:underline inline-flex items-center gap-1"
                      >
                        <span>Test Link ↗</span>
                      </a>
                    )}
                  </label>
                  <Input
                    type="url"
                    required
                    placeholder="https://example.com/"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Client / Organization
                  </label>
                  <Input
                    placeholder="e.g. Wasim Health Care & Services"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Case Description (Headline Summary) *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans text-foreground placeholder:text-muted focus:outline-hidden focus:ring-1 focus:ring-accent"
                  placeholder="Summarize the client deliverables, business model, and architectural outcome..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Category Discipline
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans text-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Deliverable Badges / Tags (Comma Separated)
                  </label>
                  <Input
                    placeholder="e.g. Medical Portal, Hospital Network, Lead Gen"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Graphic Figure Type & Order */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="text-xs font-mono font-medium text-foreground block">
                  Blueprint Graphic Aesthetic
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FIGURE_TYPES.map((fig) => (
                    <button
                      key={fig.id}
                      type="button"
                      onClick={() => setFigureType(fig.id)}
                      className={`px-3 py-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                        figureType === fig.id
                          ? "border-accent bg-accent/10 text-accent font-semibold shadow-xs"
                          : "border-border bg-surface hover:bg-surface-hover text-muted"
                      }`}
                    >
                      <span className="text-base">{fig.icon}</span>
                      <span className="text-xs font-mono">{fig.label}</span>
                    </button>
                  ))}
                </div>

                {figureType === "image" && (
                  <div className="mt-3 space-y-1.5 animate-in fade-in">
                    <label className="text-xs font-mono font-medium text-foreground">
                      Cover Screenshot / Image URL
                    </label>
                    <Input
                      placeholder="https://images.unsplash.com/... or /assets/only-x.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Featured & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border items-center">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <div className="text-xs">
                    <div className="font-mono font-semibold text-foreground">
                      Feature on Homepage Portfolio
                    </div>
                    <div className="text-muted text-[11px]">
                      Display this project in the live Selected Work grid
                    </div>
                  </div>
                </label>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted shrink-0">
                    Display Sequence:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    className="w-24 text-center font-mono"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </form>
          ) : (
            /* Live Card Preview */
            <div className="space-y-6 py-2">
              <div className="text-xs font-mono text-muted mb-2">
                This is the exact blueprint card that will render in the homepage Selected Work section:
              </div>

              <div className="max-w-md mx-auto p-1 bg-[#FAF9F5] rounded-lg border border-border shadow-md">
                <div className="relative border border-[#E9E5D8] bg-[#FBFAF5] p-6 min-h-[300px] flex flex-col justify-between rounded-xs overflow-hidden">
                  {/* Background Figure */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center p-4">
                    {renderBlueprintSvg()}
                  </div>

                  {/* Card Top */}
                  <div className="flex items-center justify-between font-mono text-xs z-10">
                    <span className="text-[11px] text-[#C08A3E] font-semibold tracking-wider">
                      {caseCode || "CASE — DEV-01"}
                    </span>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#0E2A47] font-semibold tracking-wider hover:underline inline-flex items-center gap-1"
                    >
                      <span>LIVE SITE ↗</span>
                    </a>
                  </div>

                  {/* Card Body */}
                  <div className="mt-auto pt-10 z-10 space-y-2">
                    <h3 className="font-serif text-xl font-bold text-[#0E2A47]">
                      {title || "Project Title"}
                    </h3>
                    <p className="text-xs text-[#5B6B7C] font-sans leading-relaxed">
                      {description || "Project summary description will appear here..."}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {(parsedTags.length > 0 ? parsedTags : ["Web Platform", "Next.js"]).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#E9E5D8] bg-[#FAF9F5] text-[#132437]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-elevated flex items-center justify-between">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="case-file-form"
            disabled={isSaving}
            className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs"
          >
            {isSaving ? (
              <span>Saving Case File...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{editingCase ? "Update Case File" : "Save & Publish Case File"}</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
