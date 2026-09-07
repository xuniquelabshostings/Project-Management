"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function BlogNavbar() {
  useEffect(() => {
    const timeEl = document.getElementById("blogStudioTime");
    if (!timeEl) return;

    const update = () => {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 transition-colors" suppressHydrationWarning>
      {/* Top micro strip */}
      <div className="border-b border-border/40 bg-surface-elevated/40 text-[11px] font-mono text-muted py-1 px-4 sm:px-8 flex justify-between items-center" suppressHydrationWarning>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Xunique Labs • Technical Publishing & Architecture Journal</span>
        </div>
        <div className="hidden sm:flex items-center gap-4" suppressHydrationWarning>
          <div className="flex items-center gap-1.5" suppressHydrationWarning>
            <Clock className="w-3 h-3 text-accent" />
            <span>
              Studio Time: <span id="blogStudioTime" suppressHydrationWarning>--:--:--</span>
            </span>
          </div>
          <a
            href="tel:+917458845252"
            className="hover:text-foreground transition-colors"
          >
            +91 74588 45252
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/assets/logo-mark-nobg.png"
              alt="Xunique Labs"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base tracking-tight text-foreground">
                Xunique Labs
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted">
                Engineers & Designers
              </span>
            </div>
          </Link>

          <span className="text-border hidden md:inline">|</span>

          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent" />
            <span>Studio Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4" suppressHydrationWarning>
          <Link
            href="/blog"
            className="text-xs font-mono font-medium text-accent bg-accent/10 px-2.5 py-1 rounded border border-accent/20"
          >
            All Articles
          </Link>

          <Link
            href="/#contact"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors hidden sm:inline"
          >
            Transmission Desk
          </Link>

          <a
            href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20reading%20your%20technical%20blog%20and%20would%20like%20to%20discuss%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#0E2A47] hover:bg-[#1A3F66] text-white dark:bg-accent dark:hover:bg-accent/90 text-xs font-mono px-3.5 py-1.5 rounded transition-all shadow-xs"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <div className="border-l border-border/60 pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
