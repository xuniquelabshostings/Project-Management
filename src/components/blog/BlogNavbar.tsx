"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function BlogNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on escape or resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-40 transition-colors" suppressHydrationWarning>
      {/* Top micro strip */}
      <div className="border-b border-border/40 bg-surface-elevated/40 text-[10px] sm:text-[11px] font-mono text-muted py-1.5 px-3 sm:px-8 flex justify-between items-center" suppressHydrationWarning>
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate sm:hidden">Xunique Labs • Engineering Journal</span>
          <span className="truncate hidden sm:inline">Xunique Labs • Technical Publishing & Architecture Journal</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2" suppressHydrationWarning>
          <div className="hidden sm:flex items-center gap-1.5" suppressHydrationWarning>
            <svg
              className="w-3 h-3 text-accent shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              Studio Time: <span id="blogStudioTime" suppressHydrationWarning>--:--:--</span>
            </span>
          </div>
          <a
            href="tel:+917458845252"
            className="hover:text-foreground transition-colors font-mono text-[10px] sm:text-[11px]"
          >
            +91 74588 45252
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between" suppressHydrationWarning>
        {/* Logo */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/logo-mark-nobg.png`}
              alt="Xunique Labs"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-foreground truncate">
                Xunique Labs
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-muted truncate hidden xs:block">
                Engineers & Designers
              </span>
            </div>
          </Link>

          <span className="text-border hidden md:inline">|</span>

          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 text-accent shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Studio Home</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4" suppressHydrationWarning>
          <Link
            href="/blog"
            className="text-xs font-mono font-medium text-accent bg-accent/10 px-2.5 py-1 rounded border border-accent/20"
          >
            All Articles
          </Link>

          <Link
            href="/#contact"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors"
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
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>

          <div className="border-l border-border/60 pl-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navbar Controls */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <a
            href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20reading%20your%20blog%20and%20would%20like%20to%20discuss%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-[#0E2A47] text-white dark:bg-accent text-[11px] font-mono px-2.5 py-1 rounded shadow-xs"
          >
            <span>Start</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
          </a>

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md border border-border bg-surface text-muted hover:text-foreground transition-colors"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface/98 px-4 py-5 shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 text-sm font-mono">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>Studio Home</span>
              <span className="text-xs text-muted">/</span>
            </Link>

            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md bg-accent/10 text-accent font-medium border border-accent/20 transition-colors"
            >
              <span>All Articles & Dispatches</span>
              <span className="text-xs font-mono">★</span>
            </Link>

            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>Services & Disciplines</span>
              <span className="text-xs text-muted">#services</span>
            </Link>

            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>Pricing & Plans</span>
              <span className="text-xs text-muted">#pricing</span>
            </Link>

            <Link
              href="/#work"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>Case Files</span>
              <span className="text-xs text-muted">#work</span>
            </Link>

            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>Contact Studio</span>
              <span className="text-xs text-muted">#contact</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
            <a
              href="https://wa.me/917458845252?text=Hi%20Xunique%20Labs,%20I'm%20reading%20your%20technical%20blog%20and%20would%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-mono font-medium py-2.5 rounded-md shadow-xs transition-all"
            >
              <span>Discuss Project on WhatsApp</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </a>

            <a
              href="tel:+917458845252"
              className="w-full flex items-center justify-center gap-2 border border-border bg-surface text-foreground text-xs font-mono py-2 rounded-md transition-colors"
            >
              <span>Call: +91 74588 45252</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
