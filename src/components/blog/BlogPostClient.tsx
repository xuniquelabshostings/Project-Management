"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Share2,
  Check,
  Tag,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { BlogNavbar } from "@/components/blog/BlogNavbar";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { BlogPost } from "@/types/database.types";
import {
  getLocalBlogPosts,
  getLocalBlogPostBySlug,
  incrementLocalBlogPostViews,
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

interface BlogPostClientProps {
  initialPost: BlogPost | null;
  slug: string;
}

export function BlogPostClient({ initialPost, slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function loadPost() {
      // 1. If not found in initialPost, check localStorage & Supabase
      let currentPost = initialPost;
      if (!currentPost) {
        currentPost = getLocalBlogPostBySlug(slug) || null;
      }

      try {
        const { data: dbPost } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (dbPost) {
          currentPost = dbPost as BlogPost;
        }
      } catch {}

      if (currentPost) {
        setPost(currentPost);
        incrementLocalBlogPostViews(slug);
      }

      // 2. Load related posts
      const allPosts = getLocalBlogPosts().filter(
        (p) => p.slug !== slug && p.status === "published"
      );
      setRelatedPosts(allPosts.slice(0, 3));
    }

    loadPost();
  }, [slug, initialPost]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Published recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "Published recently";
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <BlogNavbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
          <h1 className="font-serif text-3xl font-bold text-foreground">Article Not Found</h1>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto font-sans">
            The technical dispatch you are looking for has been archived, moved, or is currently under draft review.
          </p>
          <div className="mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-mono px-4 py-2 rounded-md hover:bg-foreground/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </Link>
          </div>
        </main>
        <BlogFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20">
      <BlogNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent group-hover:-translate-x-1 transition-transform" />
            <span>All Articles</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-mono text-muted hover:text-foreground transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-muted mb-4">
          <span className="px-2.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-medium uppercase tracking-wider text-[11px]">
            {post.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.published_at)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.read_time_minutes} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15] mb-6">
          {post.title}
        </h1>

        {/* Excerpt / Lead */}
        {post.excerpt && (
          <p className="text-base sm:text-lg text-muted font-sans leading-relaxed mb-8 border-l-2 border-accent pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Author Strip */}
        <div className="py-4 px-5 rounded-lg border border-border bg-surface flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              SA
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground font-sans">
                {post.author_name}
              </div>
              <div className="text-[11px] text-muted font-mono">
                Founder & Lead Software Engineer, Xunique Labs
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden border border-border mb-12 shadow-xs bg-surface-elevated">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Main Article Content */}
        <article className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5 text-accent" />
              Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 rounded bg-surface border border-border text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#0E2A47] text-white flex items-center justify-center text-lg font-serif font-bold shrink-0 border border-border">
            SA
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-foreground">
              About the Author: {post.author_name}
            </h3>
            <p className="text-xs text-muted font-sans leading-relaxed">
              Founder and technical architect at Xunique Labs. Specializes in scalable cloud systems, high-performance Next.js architectures, cross-platform mobile apps (Flutter), and production PostgreSQL design.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono">
              <a
                href="https://wa.me/917458845252"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Direct WhatsApp Scoping</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span className="text-border">•</span>
              <a
                href="mailto:support@xuniquelabs.com"
                className="text-muted hover:text-foreground hover:underline"
              >
                support@xuniquelabs.com
              </a>
            </div>
          </div>
        </div>

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h3 className="font-serif text-xl font-bold text-foreground mb-6">
              More Engineering Dispatches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/blog/${rPost.slug}`}
                  className="p-4 rounded-lg border border-border bg-surface hover:border-accent/40 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                      {rPost.category}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-foreground mt-1 line-clamp-2 leading-snug">
                      {rPost.title}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>{rPost.read_time_minutes} min read</span>
                    <ArrowRight className="w-3 h-3 text-accent" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
