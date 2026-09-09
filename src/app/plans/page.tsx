"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Sparkles,
  Filter,
  Globe,
  RotateCcw,
  ArrowUpRight,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DevelopmentPlan } from "@/types/database.types";
import {
  getLocalPlans,
  saveLocalPlan,
  deleteLocalPlan,
  resetPlansToDefault,
} from "@/lib/mock-data";
import { PlanModal } from "@/components/plans/PlanModal";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DevelopmentPlan | null>(null);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = getLocalPlans();
      setPlans(data);
    } catch (err) {
      console.error("Failed to load development plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("xunique_site_content_updated", handleUpdate);
    return () => window.removeEventListener("xunique_site_content_updated", handleUpdate);
  }, []);

  const handleSavePlan = async (data: Partial<DevelopmentPlan> & { name: string }) => {
    saveLocalPlan(data);
    loadData();
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the "${name}" plan from the pricing grid?`)) {
      deleteLocalPlan(id);
      loadData();
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Reset pricing & development plans to factory defaults? (Starter ₹1,999, Business ₹7,999, E-Commerce ₹9,999, Custom Scope)"
      )
    ) {
      resetPlansToDefault();
      loadData();
    }
  };

  const handleTogglePopular = (plan: DevelopmentPlan) => {
    saveLocalPlan({
      id: plan.id,
      name: plan.name,
      is_popular: !plan.is_popular,
      popular_badge: !plan.is_popular ? "★ MOST POPULAR" : null,
    });
    loadData();
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((item) => {
      return (
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sheet_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [plans, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Development Plans & Pricing Manager
              </h1>
              <Badge variant="outline" className="text-xs font-mono">
                Homepage Pricing Grid
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
              Configure services packages, price rates, delivery turnaround times, and feature deliverables rendered on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="font-mono text-xs text-muted hover:text-foreground"
              title="Reset default pricing tiers"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>New Plan</span>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Active Packages</span>
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="mt-2 text-2xl font-serif font-bold text-foreground">
                {plans.length}
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Pricing options
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Flagship / Popular</span>
                <Sparkles className="w-4 h-4 text-warning" />
              </div>
              <div className="mt-2 text-lg font-serif font-bold text-foreground truncate">
                {plans.find((p) => p.is_popular)?.name || "None"}
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Highlighted with badge
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Starting Rate</span>
                <Tag className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-serif font-bold text-foreground">
                ₹1,999/-
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Entry development price
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Homepage Sync</span>
                <Globe className="w-4 h-4 text-info" />
              </div>
              <div className="mt-2">
                <Link
                  href="/#pricing"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>View Pricing Grid ↗</span>
                </Link>
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Live & responsive
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & View Toggle */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Search by package name, code, price, or deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      viewMode === "table"
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      viewMode === "cards"
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Table / Cards View */}
        {filteredPlans.length === 0 ? (
          <Card className="bg-surface border-border">
            <CardContent className="py-12 text-center">
              <CreditCard className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
              <h3 className="font-serif text-base font-semibold text-foreground">
                No development plans found
              </h3>
              <p className="text-xs text-muted mt-1 font-sans">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Add your first development plan package"}
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Create Plan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <Card className="bg-surface border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Code & Package</TableHead>
                  <TableHead>Price & Period</TableHead>
                  <TableHead>Delivery Speed</TableHead>
                  <TableHead>Deliverables</TableHead>
                  <TableHead className="w-28 text-center">Badge</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                    <TableCell className="font-mono text-xs text-center text-muted font-semibold">
                      {item.display_order || index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-accent">
                            {item.sheet_code}
                          </span>
                          <span className="font-serif font-bold text-sm text-foreground">
                            {item.name}
                          </span>
                        </div>
                        {item.whatsapp_message && (
                          <p className="text-[11px] text-muted font-mono line-clamp-1 max-w-xs">
                            💬 {item.whatsapp_message}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs">
                        {item.is_custom_quote ? (
                          <Badge variant="outline" className="font-mono text-[11px]">
                            Custom Scope
                          </Badge>
                        ) : (
                          <div className="space-y-0.5">
                            {item.original_price && (
                              <div className="text-[10px] line-through text-muted">
                                {item.currency_symbol}{item.original_price}
                              </div>
                            )}
                            <div className="font-bold text-foreground">
                              {item.currency_symbol}{item.price}
                              <span className="text-[10px] text-muted ml-0.5 font-normal">
                                {item.price_period}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                        <Clock className="w-3 h-3 text-accent" />
                        <span>{item.delivery_time}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-mono text-muted">
                        {item.features?.length || 0} features
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(item)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                          item.is_popular
                            ? "bg-warning/15 text-warning font-semibold border border-warning/30"
                            : "bg-muted/10 text-muted border border-border"
                        }`}
                      >
                        {item.is_popular ? item.popular_badge || "★ POPULAR" : "Standard"}
                      </button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPlan(item);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted hover:text-foreground"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(item.id, item.name)}
                          className="h-8 w-8 p-0 text-danger hover:bg-danger/10"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredPlans.map((item) => (
              <Card
                key={item.id}
                className={`bg-surface border transition-all flex flex-col justify-between overflow-hidden shadow-xs relative ${
                  item.is_popular ? "border-warning bg-warning/5" : "border-border"
                }`}
              >
                {item.is_popular && (
                  <div className="absolute top-2 right-2 bg-warning text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                    {item.popular_badge || "★ POPULAR"}
                  </div>
                )}

                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] text-accent font-semibold">
                      {item.sheet_code}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-mono text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" />
                      <span>{item.delivery_time}</span>
                    </div>

                    <div className="py-2 border-y border-border">
                      {item.original_price && !item.is_custom_quote && (
                        <div className="text-[10px] line-through text-muted font-mono">
                          {item.currency_symbol}{item.original_price}
                        </div>
                      )}
                      <div className="font-serif text-2xl font-bold text-foreground">
                        {item.is_custom_quote ? (
                          <span>Custom Scope</span>
                        ) : (
                          <>
                            <span className="text-base text-accent mr-0.5">
                              {item.currency_symbol}
                            </span>
                            {item.price}
                            <span className="text-xs font-sans font-normal text-muted ml-0.5">
                              {item.price_period}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-xs font-sans text-muted">
                      {item.features?.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 leading-snug">{feat}</span>
                        </li>
                      ))}
                      {(item.features?.length || 0) > 5 && (
                        <li className="text-[11px] font-mono text-accent pt-0.5">
                          +{(item.features?.length || 0) - 5} more deliverables
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>

                <div className="px-5 py-3 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted text-[11px]">#{item.display_order}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPlan(item);
                        setIsModalOpen(true);
                      }}
                      className="h-7 px-2 text-xs font-mono text-muted hover:text-foreground"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(item.id, item.name)}
                      className="h-7 px-2 text-xs font-mono text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <PlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
          editingPlan={editingPlan}
          totalCount={plans.length}
        />
      </div>
    </DashboardLayout>
  );
}
