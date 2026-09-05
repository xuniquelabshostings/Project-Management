"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Eye,
  ArrowRight,
  Sparkles,
  Tag,
  BookOpen,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { BlogNavbar } from "@/components/blog/BlogNavbar";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogPost } from "@/types/database.types";
import { getLocalBlogPosts } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = [
  "All",
  "Engineering",
  "Architecture",
  "Performance",
  "Mobile Development",
];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        // Try fetching published posts from Supabase first
        const { data: dbPosts, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        const localPosts = getLocalBlogPosts().filter((p) => p.status === "published");

        if (!error && dbPosts && dbPosts.length > 0) {
          // Merge local and db
          const merged = [
            ...dbPosts,
            ...localPosts.filter((lp) => !dbPosts.some((dp) => dp.id === lp.id || dp.slug === lp.slug)),
          ];
          setPosts(merged as BlogPost[]);
        } else {
          setPosts(localPosts);
        }
      } catch {
        setPosts(getLocalBlogPosts().filter((p) => p.status === "published"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return filteredPosts.find((p) => p.featured) || filteredPosts[0];
  }, [filteredPosts]);

  const remainingPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Recent";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20">
      <BlogNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header Eyebrow & Hero Title */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Dispatch & Articles</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            Engineering, architecture, and production case studies.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted font-sans leading-relaxed">
            Written by senior engineers at Xunique Labs. Unfiltered write-ups on full-stack web platforms, Next.js optimization, mobile apps, and scalable system design.
          </p>
        </div>

        {/* Search Bar & Category Filter Strip */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-8 border-b border-border/60 mb-10">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-mono px-3.5 py-1.5 rounded-md whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-foreground text-background font-medium border-foreground shadow-xs"
                    : "bg-surface text-muted border-border hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-sans rounded-md border border-border bg-surface text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-muted">Retrieving technical journals...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl p-8 bg-surface/50 max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-muted mx-auto mb-3 opacity-40" />
            <h3 className="font-serif text-lg font-semibold text-foreground">No articles matched your query</h3>
            <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
              Try adjusting your search terms or select "All" categories to view all published dispatches.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-mono text-accent hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* FEATURED POST CARD */}
        {!isLoading && featuredPost && (
          <div className="mb-14">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block border border-border bg-surface rounded-xl overflow-hidden shadow-xs hover:border-accent/40 transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {featuredPost.cover_image && (
                  <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-surface-elevated">
                    <img
                      src={featuredPost.cover_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#0E2A47]/90 backdrop-blur-md text-white border border-white/10 text-[11px] font-mono px-2.5 py-1 rounded shadow-sm">
                        ★ Featured Architecture Note
                      </span>
                    </div>
                  </div>
                )}

                <div className={`p-6 sm:p-8 lg:p-10 flex flex-col justify-between ${featuredPost.cover_image ? "lg:col-span-5" : "lg:col-span-12"}`}>
                  <div>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted mb-3">
                      <span className="text-accent font-medium uppercase tracking-wider">
                        {featuredPost.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredPost.published_at)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {featuredPost.read_time_minutes} min read
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground group-hover:text-accent transition-colors tracking-tight leading-snug">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-3 text-xs sm:text-sm text-muted line-clamp-3 font-sans leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {featuredPost.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-muted border border-border/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                        SA
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{featuredPost.author_name}</span>
                        <span className="text-[10px] text-muted font-mono">Lead Engineer</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-accent group-hover:translate-x-1 transition-transform">
                      <span>Read Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ARTICLES GRID */}
        {!isLoading && remainingPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/40">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
                Recent Publications ({remainingPosts.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col justify-between border border-border bg-surface rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-sm transition-all"
                >
                  {post.cover_image && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-surface-elevated relative">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md border border-border text-foreground text-[10px] font-mono px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {!post.cover_image && (
                        <div className="mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                            {post.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-2">
                        <span>{formatDate(post.published_at)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.read_time_minutes} min
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors tracking-tight leading-snug">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-xs text-muted line-clamp-3 font-sans leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted text-[11px]">{post.author_name}</span>
                      <span className="text-accent group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CONSULTATION BANNER */}
        <div className="mt-20 p-8 sm:p-12 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-4">
              Direct Transmission Desk
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Have a complex software or web project in mind?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted font-sans max-w-lg mx-auto leading-relaxed">
              We review functional requirements, Figma files, and project ideas directly with senior engineers. Transparent scopes, fixed milestones, and guaranteed sub-second performance.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20interested%20in%20discussing%20a%20new%20project%20with%20your%20studio."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-mono font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all"
              >
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 bg-surface border border-border hover:border-foreground/30 text-foreground text-xs font-mono font-medium px-5 py-2.5 rounded-lg transition-all"
              >
                <span>Submit Specification Brief</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
