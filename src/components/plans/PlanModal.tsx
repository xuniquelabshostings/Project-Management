"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Sparkles,
  MessageSquare,
  Clock,
  Tag,
} from "lucide-react";
import { DevelopmentPlan } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DevelopmentPlan> & { name: string }) => Promise<void>;
  editingPlan: DevelopmentPlan | null;
  totalCount: number;
}

export function PlanModal({
  isOpen,
  onClose,
  onSave,
  editingPlan,
  totalCount,
}: PlanModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const [name, setName] = useState("");
  const [sheetCode, setSheetCode] = useState("");
  const [price, setPrice] = useState("4,999");
  const [originalPrice, setOriginalPrice] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [pricePeriod, setPricePeriod] = useState("/-");
  const [deliveryTime, setDeliveryTime] = useState("3–5 Days");
  const [isPopular, setIsPopular] = useState(false);
  const [popularBadge, setPopularBadge] = useState("★ MOST POPULAR");
  const [isCustomQuote, setIsCustomQuote] = useState(false);
  const [features, setFeatures] = useState<string[]>([
    "Custom responsive design",
    "High performance architecture",
    "SEO optimization",
    "Full code ownership",
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [ctaText, setCtaText] = useState("Book Now →");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name);
      setSheetCode(editingPlan.sheet_code);
      setPrice(editingPlan.price);
      setOriginalPrice(editingPlan.original_price || "");
      setCurrencySymbol(editingPlan.currency_symbol || "₹");
      setPricePeriod(editingPlan.price_period || "/-");
      setDeliveryTime(editingPlan.delivery_time);
      setIsPopular(editingPlan.is_popular);
      setPopularBadge(editingPlan.popular_badge || "★ MOST POPULAR");
      setIsCustomQuote(editingPlan.is_custom_quote);
      setFeatures(editingPlan.features && editingPlan.features.length > 0 ? [...editingPlan.features] : []);
      setCtaText(editingPlan.cta_text);
      setWhatsappMessage(editingPlan.whatsapp_message || "");
      setDisplayOrder(editingPlan.display_order);
    } else {
      const codeNum = String(totalCount + 1).padStart(2, "0");
      setName("");
      setSheetCode(`SHEET P-${codeNum}`);
      setPrice("4,999");
      setOriginalPrice("7999");
      setCurrencySymbol("₹");
      setPricePeriod("/-");
      setDeliveryTime("3–5 Days");
      setIsPopular(false);
      setPopularBadge("★ MOST POPULAR");
      setIsCustomQuote(false);
      setFeatures([
        "Up to 3 custom designed pages",
        "Mobile & desktop responsive layout",
        "WhatsApp & contact form integration",
        "Fast page load speed (<1.5s)",
        "Free deployment assistance",
        "Full source code ownership",
      ]);
      setCtaText("Book Now →");
      setWhatsappMessage("");
      setDisplayOrder(totalCount + 1);
    }
    setErrorMsg("");
    setActiveTab("edit");
  }, [editingPlan, totalCount, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFeatures([...features, newFeatureInput.trim()]);
      setNewFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please provide a plan name.");
      return;
    }
    if (features.length === 0) {
      setErrorMsg("Please add at least one feature item to the plan.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      const autoWhatsapp =
        whatsappMessage.trim() ||
        `Hi Xunique Labs, I'm interested in the ${name.trim()} Plan (${
          isCustomQuote ? "Custom Quote" : `${currencySymbol}${price}${pricePeriod}`
        }, ${deliveryTime}). Let's discuss scope and get started.`;

      await onSave({
        ...(editingPlan ? { id: editingPlan.id } : {}),
        name: name.trim(),
        sheet_code: sheetCode.trim() || `SHEET P-${String(displayOrder).padStart(2, "0")}`,
        price: isCustomQuote ? "Custom" : price.trim(),
        original_price: isCustomQuote || !originalPrice.trim() ? null : originalPrice.trim(),
        currency_symbol: isCustomQuote ? "" : currencySymbol.trim(),
        price_period: isCustomQuote ? "Scope Based" : pricePeriod.trim(),
        delivery_time: deliveryTime.trim(),
        is_popular: isPopular,
        popular_badge: isPopular ? popularBadge.trim() : null,
        is_custom_quote: isCustomQuote,
        features,
        cta_text: ctaText.trim() || "Book Now →",
        whatsapp_message: autoWhatsapp,
        display_order: Number(displayOrder) || 1,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save development plan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                {editingPlan ? "Edit Development Plan" : "Create Development Plan"}
              </h2>
              <p className="text-xs text-muted font-mono">
                Manage package tiers, pricing, delivery speed, and deliverables on the homepage
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
                Configurator
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
                Card Preview
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs font-sans text-danger flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "edit" ? (
            <form id="plan-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Package Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Business Website, E-Commerce Store"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Sheet Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Sheet Code
                  </label>
                  <Input
                    placeholder="SHEET P-01"
                    value={sheetCode}
                    onChange={(e) => setSheetCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-elevated/60 border border-border">
                {/* Custom quote checkbox */}
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={isCustomQuote}
                      onChange={(e) => setIsCustomQuote(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="font-semibold text-foreground">
                      Custom Quote / Scope-Based Pricing (No Fixed Price)
                    </span>
                  </label>
                </div>

                {!isCustomQuote ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-muted">Currency</label>
                      <Input
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        className="font-mono text-center"
                        placeholder="₹"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-muted">Special Price *</label>
                      <Input
                        required={!isCustomQuote}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="font-mono"
                        placeholder="7,999"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-muted">Original / Strike Price</label>
                      <Input
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="font-mono"
                        placeholder="11999"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-muted">Suffix</label>
                      <Input
                        value={pricePeriod}
                        onChange={(e) => setPricePeriod(e.target.value)}
                        className="font-mono"
                        placeholder="/-"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-4 text-xs font-sans text-muted">
                    This plan will display as <strong>Custom / Scope Based</strong> with a negotiation brief button.
                  </div>
                )}

                <div className="sm:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Delivery Timeline *</span>
                    </label>
                    <Input
                      required
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      placeholder="e.g. 1–2 Days, 3–5 Days, 2–4 Weeks"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-foreground">
                      Button CTA Text
                    </label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Book Now →, Launch Store →"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Ribbon Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3.5 rounded-lg border border-border bg-surface">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <div className="text-xs">
                    <div className="font-mono font-semibold text-foreground">
                      Mark as Recommended / Popular Plan
                    </div>
                    <div className="text-muted text-[11px]">
                      Highlights with brass ribbon border on homepage
                    </div>
                  </div>
                </label>

                {isPopular && (
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-muted">Ribbon Label Text</label>
                    <Input
                      value={popularBadge}
                      onChange={(e) => setPopularBadge(e.target.value)}
                      placeholder="★ MOST POPULAR"
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Features List Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-medium text-foreground">
                    Plan Deliverables & Features ({features.length} items) *
                  </label>
                  <span className="text-[11px] text-muted font-mono">
                    Press Enter or click Add to append
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type feature deliverable (e.g. Razorpay Payment Gateway, 5 Pages)..."
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    className="bg-foreground text-background font-mono text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add</span>
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 rounded-lg border border-border bg-surface-elevated/40">
                  {features.map((feat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 px-3 py-1.5 rounded bg-surface border border-border text-xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate text-foreground font-sans">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-muted hover:text-danger p-1 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Scoping Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground flex items-center justify-between">
                  <span>Custom WhatsApp Inquiry Message (Optional)</span>
                  <span className="text-[11px] text-muted font-mono">Pre-filled text when client clicks CTA</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-sans text-foreground placeholder:text-muted focus:outline-hidden focus:ring-1 focus:ring-accent"
                  placeholder={`Hi Xunique Labs, I'm interested in the ${name || "Plan"} Plan...`}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                />
              </div>

              {/* Display Sequence Order */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs">
                  <div className="font-mono font-medium text-foreground">Display Column Position</div>
                  <div className="text-muted text-[11px]">1 = Leftmost Starter, 4 = Enterprise Custom</div>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  className="w-24 text-center font-mono"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                />
              </div>
            </form>
          ) : (
            /* Live Card Preview */
            <div className="space-y-6 py-2">
              <div className="text-xs font-mono text-muted mb-2">
                This is how this plan card will look in the homepage pricing section:
              </div>

              <div className="max-w-sm mx-auto p-1 bg-[#FAF9F5] rounded-lg border border-border shadow-md">
                <div
                  className={`relative p-6 rounded-xs border flex flex-col justify-between ${
                    isPopular
                      ? "border-[#C08A3E] bg-[#FFFDF7] shadow-lg"
                      : isCustomQuote
                      ? "border-[#0E2A47]/20 bg-linear-to-b from-[#FBF8EE] to-[#F5EFE0]"
                      : "border-[#E9E5D8] bg-[#FBFAF5]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-3 right-3 bg-[#C08A3E] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs tracking-wider">
                      {popularBadge || "★ POPULAR"}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="font-mono text-[11px] text-[#C08A3E] tracking-widest uppercase">
                      {sheetCode || "SHEET P-01"}
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0E2A47]">
                      {name || "Plan Name"}
                    </h3>
                    <div className="font-mono text-[11px] text-[#5B6B7C]">
                      🕓 Delivery: {deliveryTime || "3–5 Days"}
                    </div>

                    <div className="py-2 border-y border-[#E9E5D8]/80">
                      {originalPrice && !isCustomQuote && (
                        <div className="text-xs line-through text-[#5B6B7C] font-mono">
                          {currencySymbol}{originalPrice}
                        </div>
                      )}
                      <div className="font-serif text-3xl font-bold text-[#0E2A47]">
                        {isCustomQuote ? (
                          <span>Custom Scope</span>
                        ) : (
                          <>
                            <span className="text-lg text-[#C08A3E] mr-0.5">{currencySymbol}</span>
                            {price}
                            <span className="text-sm font-sans font-normal text-[#5B6B7C] ml-1">
                              {pricePeriod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 pt-2 text-xs font-sans text-[#132437]">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#5C8A6E] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 rounded-xs font-mono text-xs font-semibold text-center transition-all ${
                        isPopular
                          ? "bg-[#0E2A47] text-white"
                          : "border border-[#0E2A47] text-[#0E2A47] bg-transparent"
                      }`}
                    >
                      {ctaText || "Get Started →"}
                    </button>
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
            form="plan-form"
            disabled={isSaving}
            className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs"
          >
            {isSaving ? (
              <span>Saving Plan...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{editingPlan ? "Update Plan" : "Save & Publish Plan"}</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
