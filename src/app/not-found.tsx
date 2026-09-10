"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostClient } from "@/components/blog/BlogPostClient";

export default function NotFound() {
  const [detectedBlogSlug, setDetectedBlogSlug] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const cleanPath = pathname.replace(/^\/+|\/+$/g, "");
      
      // Match pattern like /blog/my-article-slug or Project-Management/blog/my-article-slug
      const blogMatch = cleanPath.match(/(?:^|\/)blog\/([^/?#]+)/);
      if (blogMatch && blogMatch[1]) {
        setDetectedBlogSlug(decodeURIComponent(blogMatch[1]));
      }
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // If the user hit a custom or newly created blog post on static hosting (Cloudflare/GitHub Pages)
  if (detectedBlogSlug) {
    return <BlogPostClient initialPost={null} slug={detectedBlogSlug} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center selection:bg-accent/20">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
            404 • Resource Not Found
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-2 tracking-tight">
            Page Not Located
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-2 font-sans leading-relaxed">
            The requested route does not exist or has been moved. Check the URL or return to the studio overview.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full">
              <Home className="w-4 h-4 mr-1.5" /> Return Home
            </Button>
          </Link>
          <Link href="/management" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Operations Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-xs text-muted/60 mt-8 font-mono">
        &copy; {new Date().getFullYear()} Xunique Labs • Design & Engineering Studio
      </p>
    </div>
  );
}
