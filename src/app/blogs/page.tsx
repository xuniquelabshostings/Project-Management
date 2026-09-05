"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Sparkles,
  Filter,
  FileText,
  Radio,
  Globe,
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
import { BlogPost, BlogStatus } from "@/types/database.types";
import {
  getLocalBlogPosts,
  saveLocalBlogPost,
  deleteLocalBlogPost,
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";
import { BlogModal } from "@/components/blogs/BlogModal";

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Try fetching from Supabase
      const { data: dbPosts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      const localList = getLocalBlogPosts();

      if (!error && dbPosts && dbPosts.length > 0) {
        const merged = [
          ...dbPosts,
          ...localList.filter((lp) => !dbPosts.some((dp) => dp.id === lp.id || dp.slug === lp.slug)),
        ];
        setPosts(merged as BlogPost[]);
      } else {
        setPosts(localList);
      }
    } catch (err) {
      console.warn("Could not query supabase for blog posts, using local cache:", err);
      setPosts(getLocalBlogPosts());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePost = async (postData: Partial<BlogPost> & { title: string }) => {
    // 1. Save to local storage
    const saved = saveLocalBlogPost(postData);

    // 2. Try saving to Supabase
    try {
      if (postData.id && !postData.id.startsWith("blog-")) {
        await supabase
          .from("blog_posts")
          .update({
            title: saved.title,
            slug: saved.slug,
            category: saved.category,
            tags: saved.tags,
            excerpt: saved.excerpt,
            content: saved.content,
            cover_image: saved.cover_image,
            author_name: saved.author_name,
            status: saved.status,
            read_time_minutes: saved.read_time_minutes,
            featured: saved.featured,
            published_at: saved.published_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", postData.id);
      } else {
        await supabase.from("blog_posts").insert({
          title: saved.title,
          slug: saved.slug,
          category: saved.category,
          tags: saved.tags,
          excerpt: saved.excerpt,
          content: saved.content,
          cover_image: saved.cover_image,
          author_name: saved.author_name,
          status: saved.status,
          read_time_minutes: saved.read_time_minutes,
          featured: saved.featured,
          published_at: saved.published_at,
        });
      }
    } catch (err) {
      console.warn("Supabase save optional error:", err);
    }

    await loadData();
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technical article?")) return;
    deleteLocalBlogPost(id);
    try {
      await supabase.from("blog_posts").delete().eq("id", id);
    } catch {}
    await loadData();
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus: BlogStatus = post.status === "published" ? "draft" : "published";
    await handleSavePost({
      ...post,
      status: nextStatus,
    });
  };

  // Metrics
  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  // Filtered List
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        post.category.toLowerCase() === categoryFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Technical Blog & Editorial Engine
            </h1>
            <p className="text-xs text-muted font-sans mt-0.5">
              Draft, publish, and manage architectural write-ups and engineering dispatches for Xunique Labs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-surface text-xs font-mono text-muted hover:text-foreground transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>View Public Blog ↗</span>
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingPost(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Article
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase">Total Articles</span>
                <div className="font-serif text-2xl font-bold text-foreground mt-1">{totalPosts}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-muted">
                <BookOpen className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase">Live Published</span>
                <div className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {publishedCount}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase">Drafts & Review</span>
                <div className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {draftCount}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <FileText className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase">Total Readers</span>
                <div className="font-serif text-2xl font-bold text-foreground mt-1">
                  {totalViews.toLocaleString()}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Eye className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search title, slug, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-sans rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-sans rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Categories</option>
              <option value="engineering">Engineering</option>
              <option value="architecture">Architecture</option>
              <option value="performance">Performance</option>
              <option value="mobile development">Mobile Development</option>
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <Card className="border-border overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-elevated/40">
                <TableHead className="w-[38%]">Article Title & Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Read Time</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted text-xs font-mono">
                    Loading technical dispatches...
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted text-xs">
                    No articles found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm font-sans">
                            {post.title}
                          </span>
                          {post.featured && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/10 text-accent border border-accent/20">
                              ★ Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mt-0.5">
                          <span>/blog/{post.slug}</span>
                          <span>•</span>
                          <span>By {post.author_name}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border">
                        {post.category}
                      </span>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle status"
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={
                            post.status === "published"
                              ? "success"
                              : post.status === "draft"
                              ? "warning"
                              : "secondary"
                          }
                          className="capitalize cursor-pointer transition-opacity hover:opacity-80"
                        >
                          {post.status}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-muted">
                      {post.read_time_minutes} min
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-muted">
                      {post.views_count}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          title="View Live Article"
                          className="p-1.5 rounded text-muted hover:text-accent hover:bg-surface-elevated transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setIsModalOpen(true);
                          }}
                          title="Edit Article"
                          className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete Article"
                          className="p-1.5 rounded text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Editor Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        editingPost={editingPost}
      />
    </DashboardLayout>
  );
}
