"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
        title="Toggle theme"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        <Sun className="h-4 w-4 text-accent dark:hidden" />
        <Moon className="h-4 w-4 text-accent hidden dark:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-border bg-surface py-1 shadow-lg z-50 text-xs">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 transition-colors ${
              theme === "light"
                ? "bg-accent-light text-accent font-medium"
                : "text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 transition-colors ${
              theme === "dark"
                ? "bg-accent-light text-accent font-medium"
                : "text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 transition-colors ${
              theme === "system"
                ? "bg-accent-light text-accent font-medium"
                : "text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
