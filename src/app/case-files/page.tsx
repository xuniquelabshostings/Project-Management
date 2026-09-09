"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
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
  Layers,
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
import { CaseFile } from "@/types/database.types";
import {
  getLocalCaseFiles,
  saveLocalCaseFile,
  deleteLocalCaseFile,
  resetCaseFilesToDefault,
} from "@/lib/mock-data";
import { CaseFileModal } from "@/components/portfolio/CaseFileModal";

export default function AdminCaseFilesPage() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseFile | null>(null);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = getLocalCaseFiles();
      setCaseFiles(data);
    } catch (err) {
      console.error("Failed to load case files:", err);
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

  const handleSaveCase = async (data: Partial<CaseFile> & { title: string }) => {
    saveLocalCaseFile(data);
    loadData();
  };

  const handleDeleteCase = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the portfolio showcase?`)) {
      deleteLocalCaseFile(id);
      loadData();
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Reset portfolio to factory defaults? (OurHomeIndia, Mr.Nothing, Wasim Health Care, FreedomNex)"
      )
    ) {
      resetCaseFilesToDefault();
      loadData();
    }
  };

  const handleToggleFeatured = (item: CaseFile) => {
    saveLocalCaseFile({
      id: item.id,
      title: item.title,
      featured: !item.featured,
    });
    loadData();
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    caseFiles.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [caseFiles]);

  // Filtered list
  const filteredCases = useMemo(() => {
    return caseFiles.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.case_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [caseFiles, searchQuery, categoryFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Case Files & Portfolio Manager
              </h1>
              <Badge variant="outline" className="text-xs font-mono">
                Homepage Selected Work
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
              Create, update, and manage live production portfolio case files rendered on the studio homepage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="font-mono text-xs text-muted hover:text-foreground"
              title="Reset default case files"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setEditingCase(null);
                setIsModalOpen(true);
              }}
              className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>New Case File</span>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Total Case Files</span>
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <div className="mt-2 text-2xl font-serif font-bold text-foreground">
                {caseFiles.length}
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Managed platforms
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Homepage Active</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-serif font-bold text-foreground">
                {caseFiles.filter((c) => c.featured).length}
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Visible in `#work` section
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Industries</span>
                <Layers className="w-4 h-4 text-info" />
              </div>
              <div className="mt-2 text-2xl font-serif font-bold text-foreground">
                {categories.length || 4}
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Covered disciplines
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted uppercase">Live Preview</span>
                <Globe className="w-4 h-4 text-warning" />
              </div>
              <div className="mt-2">
                <Link
                  href="/#work"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>View Homepage Grid ↗</span>
                </Link>
              </div>
              <div className="text-[11px] text-muted font-sans mt-0.5">
                Real-time synchronized
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter / Search Bar */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Search by title, case code, tags, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Category:</span>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-sans text-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
                >
                  <option value="all">All Categories ({caseFiles.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({caseFiles.filter((c) => c.category === cat).length})
                    </option>
                  ))}
                </select>

                <div className="border-l border-border pl-2 ml-1 flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs font-mono">
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

        {/* Case Files Table / Cards View */}
        {filteredCases.length === 0 ? (
          <Card className="bg-surface border-border">
            <CardContent className="py-12 text-center">
              <Briefcase className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
              <h3 className="font-serif text-base font-semibold text-foreground">
                No case files found
              </h3>
              <p className="text-xs text-muted mt-1 font-sans">
                {searchQuery || categoryFilter !== "all"
                  ? "Try clearing your filters or search query"
                  : "Get started by adding your first project case file"}
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCase(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90 font-mono text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Create Case File</span>
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
                  <TableHead>Code & Project</TableHead>
                  <TableHead>Category & Tags</TableHead>
                  <TableHead>Live Website</TableHead>
                  <TableHead className="w-24 text-center">Homepage</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                    <TableCell className="font-mono text-xs text-center text-muted font-semibold">
                      {item.display_order || index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-accent">
                            {item.case_code}
                          </span>
                          <span className="font-serif font-bold text-sm text-foreground">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-1 font-sans max-w-md">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[11px] font-sans">
                          {item.category}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags?.length > 3 && (
                            <span className="text-[10px] font-mono text-muted">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <a
                        href={item.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-foreground hover:text-accent hover:underline group"
                      >
                        <span className="max-w-[160px] truncate">
                          {item.live_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent transition-colors" />
                      </a>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors ${
                          item.featured
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-muted/10 text-muted border border-border"
                        }`}
                      >
                        {item.featured ? "Active" : "Hidden"}
                      </button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                          title="Open Live Site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCase(item);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted hover:text-foreground"
                          title="Edit Case File"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCase(item.id, item.title)}
                          className="h-8 w-8 p-0 text-danger hover:bg-danger/10"
                          title="Delete Case File"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map((item) => (
              <Card
                key={item.id}
                className="bg-surface border-border hover:border-accent/40 transition-all flex flex-col justify-between overflow-hidden group shadow-xs"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-accent font-semibold tracking-wider">
                      {item.case_code}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.featured
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-muted/10 text-muted border border-border"
                      }`}
                    >
                      {item.featured ? "Homepage Active" : "Hidden"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.client_name && (
                      <div className="text-[11px] font-mono text-muted mb-1.5">
                        Client: {item.client_name}
                      </div>
                    )}
                    <p className="text-xs text-muted font-sans line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <div className="px-5 py-3 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-xs font-mono">
                  <a
                    href={item.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Visit Live Site</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCase(item);
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
                      onClick={() => handleDeleteCase(item.id, item.title)}
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
        <CaseFileModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCase(null);
          }}
          onSave={handleSaveCase}
          editingCase={editingCase}
          totalCount={caseFiles.length}
        />
      </div>
    </DashboardLayout>
  );
}
