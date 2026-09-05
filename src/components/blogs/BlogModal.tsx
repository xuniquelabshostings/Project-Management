"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Eye,
  Edit3,
  Sparkles,
  Tag,
  Clock,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { BlogPost, BlogStatus } from "@/types/database.types";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: Partial<BlogPost> & { title: string }) => Promise<void>;
  editingPost: BlogPost | null;
}

const CATEGORY_OPTIONS = [
  "Engineering",
  "Architecture",
  "Performance",
  "Mobile Development",
  "Cloud & DevOps",
  "UI/UX Design",
  "Product Strategy",
];

export function BlogModal({
  isOpen,
  onClose,
  onSave,
  editingPost,
}: BlogModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugAuto, setIsSlugAuto] = useState(true);
  const [category, setCategory] = useState("Engineering");
  const [tagsInput, setTagsInput] = useState("Next.js, Architecture");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [authorName, setAuthorName] = useState("Sayyed Abdul Ali");
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [readTime, setReadTime] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setSlug(editingPost.slug);
      setIsSlugAuto(false);
      setCategory(editingPost.category || "Engineering");
      setTagsInput(editingPost.tags?.join(", ") || "");
      setExcerpt(editingPost.excerpt || "");
      setContent(editingPost.content || "");
      setCoverImage(editingPost.cover_image || "");
      setAuthorName(editingPost.author_name || "Sayyed Abdul Ali");
      setStatus(editingPost.status);
      setReadTime(editingPost.read_time_minutes || 5);
      setFeatured(editingPost.featured ?? false);
    } else {
      setTitle("");
      setSlug("");
      setIsSlugAuto(true);
      setCategory("Engineering");
      setTagsInput("Next.js, Full-Stack");
      setExcerpt("");
      setContent(
        `## Introduction\n\nStart writing your technical article here in Markdown...\n\n### Core Architecture\n\nExplain key engineering concepts, tradeoffs, and code samples:\n\n\`\`\`tsx\n// Code snippet here\nconst result = true;\n\`\`\`\n\n### Conclusion\n\nSummarize the results and takeaways.`
      );
      setCoverImage("");
      setAuthorName("Sayyed Abdul Ali");
      setStatus("published");
      setReadTime(5);
      setFeatured(false);
    }
    setActiveTab("write");
    setErrorMsg("");
  }, [editingPost, isOpen]);

  // Auto-generate slug from title if auto is enabled
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isSlugAuto && !editingPost) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 70);
      setSlug(generated);
    }
    // Update estimated reading time
    const words = content.trim().split(/\s+/).length;
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    const words = val.trim().split(/\s+/).length;
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Article title is required.");
      return;
    }

    const finalSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 70);

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setIsSaving(true);
      setErrorMsg("");
      await onSave({
        id: editingPost?.id,
        title: title.trim(),
        slug: finalSlug,
        category,
        tags: tagsArray,
        excerpt: excerpt.trim(),
        content: content.trim(),
        cover_image: coverImage.trim() || null,
        author_name: authorName.trim() || "Sayyed Abdul Ali",
        status,
        read_time_minutes: Number(readTime) || 3,
        featured,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save blog post.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between bg-surface-elevated/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                {editingPost ? "Edit Technical Article" : "Create Technical Article"}
              </h2>
              <p className="text-[11px] font-mono text-muted">
                Xunique Labs Engineering Journal & Case Publishing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Write vs Preview Toggle */}
            <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "write"
                    ? "bg-accent text-white font-medium shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-accent text-white font-medium shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "write" ? (
            <div className="space-y-5">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Article Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Why Next.js & React Server Components are the Gold Standard"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="font-serif text-base"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted">
                      URL Slug *
                    </label>
                    <span className="text-[10px] font-mono text-accent">
                      /blog/{slug || "..."}
                    </span>
                  </div>
                  <Input
                    placeholder="custom-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugAuto(false);
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Category, Tags, Status, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-sans rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BlogStatus)}
                    className="w-full px-3 py-2 text-xs font-sans rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-medium"
                  >
                    <option value="published">Published (Live on site)</option>
                    <option value="draft">Draft (Internal only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Read Time (Mins)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={readTime}
                    onChange={(e) => setReadTime(parseInt(e.target.value, 10) || 3)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                    />
                    <span className="text-xs font-sans text-foreground">
                      Featured Hero Post
                    </span>
                  </label>
                </div>
              </div>

              {/* Tags & Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Tags (Comma Separated)
                  </label>
                  <Input
                    placeholder="Next.js, Performance, Architecture, Full-Stack"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Cover Image URL (Optional)
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/... or /assets/only-x.png"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted">
                  Excerpt / Meta Description (1–2 Sentences)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Summary of the article for social sharing and search engines..."
                  className="w-full px-3 py-2 text-xs font-sans rounded-md border border-border bg-surface text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
                />
              </div>

              {/* Content Markdown Editor */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Article Body (Full Markdown Supported)
                  </label>
                  <span className="text-[10px] font-mono text-muted">
                    Supports ## Headings, ```code, &gt; quotes, and tables
                  </span>
                </div>
                <textarea
                  rows={12}
                  required
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Draft your engineering write-up here..."
                  className="w-full p-3 font-mono text-xs leading-relaxed rounded-md border border-border bg-[#0B1522] text-[#E0E6ED] focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          ) : (
            /* PREVIEW TAB */
            <div className="p-4 sm:p-6 border border-border/70 rounded-xl bg-surface">
              <div className="mb-4 flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-accent uppercase">{category}</span>
                <span>•</span>
                <span>{readTime} min read</span>
                <span>•</span>
                <span className="capitalize">{status}</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                {title || "Untitled Technical Article"}
              </h1>
              {excerpt && (
                <p className="text-sm text-muted font-sans italic border-l-2 border-accent pl-3 mb-6">
                  {excerpt}
                </p>
              )}
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full max-h-72 object-cover rounded-lg border border-border mb-6"
                />
              )}
              <div className="pt-2">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between shrink-0">
            <div className="text-xs font-mono text-muted">
              Author: <span className="text-foreground">{authorName}</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? "Saving Article..." : editingPost ? "Update Article" : "Publish Article"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
